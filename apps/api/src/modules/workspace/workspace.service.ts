import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
    CreateWorkspaceDto,
    PERMISSION,
    ProjectNavigationSummary,
    UserWorkspaceNavigationSummary,
    UserWorkspaceSummary,
    WorkspaceMember,
    WorkspaceRowDto,
    WorkspaceStats,
} from '@shared/validations'
import { and, eq, gte, isNull, or, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { alias } from 'drizzle-orm/pg-core'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'
import { CompanyService } from '../company/company.service'

@Injectable()
export class WorkspaceService {
    constructor(
        @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
        private readonly companyService: CompanyService,
    ) {}

    async getWorkspaceBySlugOrFail(workspaceSlug: string): Promise<WorkspaceRowDto> {
        const [workspace] = await this.db
            .select()
            .from(schema.WorkspaceSchema)
            .where(eq(schema.WorkspaceSchema.slug, workspaceSlug))
            .limit(1)

        if (!workspace) throw new NotFoundException('Workspace not found')

        return workspace
    }

    async createWorkspace(dto: CreateWorkspaceDto, userId: string): Promise<WorkspaceRowDto> {
        const userCompanyLevelPermissionLevel =
            await this.companyService.getUserCompanyLevelPermissionLevel(userId, dto.companyId)

        if (!userCompanyLevelPermissionLevel || userCompanyLevelPermissionLevel < 3)
            throw new ForbiddenException('Insufficient permissions')

        const [workspace] = await this.db
            .insert(schema.WorkspaceSchema)
            .values({ ...dto, createdBy: userId })
            .returning()
        return workspace
    }

    async getViewableUserWorkspaces(userId: string): Promise<UserWorkspaceNavigationSummary[]> {
        return this.db
            .select({
                name: schema.WorkspaceSchema.name,
                slug: schema.WorkspaceSchema.slug,
                id: schema.WorkspaceSchema.id,
                companySlug: schema.CompanySchema.slug,
            })
            .from(schema.WorkspaceSchema)
            .innerJoin(
                schema.CompanyMemberSchema,
                eq(schema.WorkspaceSchema.companyId, schema.CompanyMemberSchema.companyId),
            )
            .innerJoin(
                schema.CompanySchema,
                eq(schema.CompanySchema.id, schema.WorkspaceSchema.companyId),
            )
            .where(eq(schema.CompanyMemberSchema.userId, userId))
    }

    async getManageableUserWorkspaces(userId: string): Promise<UserWorkspaceSummary[]> {
        const workspacePerm = alias(schema.PermissionSchema, 'workspace_perm')
        const companyPerm = alias(schema.PermissionSchema, 'company_perm')
        return this.db
            .select({
                name: schema.WorkspaceSchema.name,
                slug: schema.WorkspaceSchema.slug,
                id: schema.WorkspaceSchema.id,
            })
            .from(schema.WorkspaceSchema)
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                and(
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, schema.WorkspaceSchema.id),
                    eq(schema.UserWorkspacePermissionSchema.userId, userId),
                ),
            )
            .leftJoin(
                workspacePerm,
                eq(schema.UserWorkspacePermissionSchema.permissionId, workspacePerm.id),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                and(
                    eq(
                        schema.UserCompanyPermissionSchema.companyId,
                        schema.WorkspaceSchema.companyId,
                    ),
                    eq(schema.UserCompanyPermissionSchema.userId, userId),
                ),
            )
            .leftJoin(
                companyPerm,
                eq(schema.UserCompanyPermissionSchema.permissionId, companyPerm.id),
            )
            .where(
                or(
                    gte(workspacePerm.level, PERMISSION.admin.level),
                    gte(companyPerm.level, PERMISSION.admin.level),
                ),
            )
    }

    async getUserWorkspaceLevelPermissionsLevel(
        userId: string,
        workspaceId: string,
    ): Promise<number | null> {
        const workspacePerm = alias(schema.PermissionSchema, 'workspace_perm')
        const companyPerm = alias(schema.PermissionSchema, 'company_perm')

        const [result] = await this.db
            .select({
                workspacePermLevel: workspacePerm.level,
                companyPermLevel: companyPerm.level,
            })
            .from(schema.WorkspaceSchema)
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                and(
                    eq(schema.UserWorkspacePermissionSchema.userId, userId),
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                ),
            )
            .leftJoin(
                workspacePerm,
                eq(schema.UserWorkspacePermissionSchema.permissionId, workspacePerm.id),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                and(
                    eq(schema.UserCompanyPermissionSchema.userId, userId),
                    eq(
                        schema.UserCompanyPermissionSchema.companyId,
                        schema.WorkspaceSchema.companyId,
                    ),
                ),
            )
            .leftJoin(
                companyPerm,
                eq(schema.UserCompanyPermissionSchema.permissionId, companyPerm.id),
            )
            .where(eq(schema.WorkspaceSchema.id, workspaceId))
            .limit(1)

        if (!result) return null

        const { workspacePermLevel, companyPermLevel } = result
        if (!workspacePermLevel) return companyPermLevel
        if (!companyPermLevel) return workspacePermLevel

        return Math.max(workspacePermLevel, companyPermLevel)
    }

    async getWorkspaceDetails(workspaceSlug: string, userId: string) {
        const workspace = await this.getWorkspaceBySlugOrFail(workspaceSlug)
        await this.doesUserHaveSufficientWorkspacePermissionOrFail(
            workspace.id,
            userId,
            PERMISSION.maintainer.level,
        )

        const [stats, members, workspaceProjects] = await Promise.all([
            this.getWorkspaceStats(workspace.id),
            this.getWorkspaceMembers(workspace.id),
            this.getWorkspaceProjects(workspace.id),
        ])

        return { workspace, stats, members, workspaceProjects }
    }

    async getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats> {
        const workspacePermission = alias(schema.PermissionSchema, 'workspace_perm')
        const companyPermission = alias(schema.PermissionSchema, 'company_perm')

        const [stats] = await this.db
            .select({
                memberCount: sql<number>`count(distinct CASE
                WHEN ${workspacePermission} IS NOT NULL THEN ${schema.UserWorkspacePermissionSchema.userId}
                WHEN ${companyPermission} IS NOT NULL THEN ${schema.UserCompanyPermissionSchema.userId}
                ELSE NULL
            END)`,
                projectCount: sql<number>`count(distinct ${schema.ProjectSchema.id})`,
            })
            .from(schema.WorkspaceSchema)
            .leftJoin(schema.ProjectSchema, eq(schema.ProjectSchema.workspaceId, workspaceId))
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                eq(schema.UserWorkspacePermissionSchema.workspaceId, schema.WorkspaceSchema.id),
            )
            .leftJoin(
                workspacePermission,
                eq(workspacePermission.id, schema.UserWorkspacePermissionSchema.permissionId),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                eq(schema.UserCompanyPermissionSchema.companyId, schema.WorkspaceSchema.companyId),
            )
            .leftJoin(
                companyPermission,
                eq(companyPermission.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(eq(schema.WorkspaceSchema.id, workspaceId))

        return stats
    }

    async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
        const workspacePermission = alias(schema.PermissionSchema, 'workspace_permission')
        const companyPermission = alias(schema.PermissionSchema, 'company_permission')

        // users with explicit workspace permission, also fetch their company permission
        const groupA = await this.db
            .select({
                id: schema.UserSchema.id,
                fullname: schema.UserSchema.fullname,
                username: schema.UserSchema.username,
                email: schema.UserSchema.email,
                avatarUrl: schema.UserSchema.avatarUrl,
                workspacePermissionId: workspacePermission.id,
                workspacePermissionName: workspacePermission.name,
                companyPermissionId: companyPermission.id,
                companyPermissionName: companyPermission.name,
            })
            .from(schema.UserWorkspacePermissionSchema)
            .innerJoin(
                schema.UserSchema,
                eq(schema.UserSchema.id, schema.UserWorkspacePermissionSchema.userId),
            )
            .innerJoin(
                workspacePermission,
                eq(workspacePermission.id, schema.UserWorkspacePermissionSchema.permissionId),
            )
            .leftJoin(schema.WorkspaceSchema, eq(schema.WorkspaceSchema.id, workspaceId))
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                and(
                    eq(
                        schema.UserCompanyPermissionSchema.companyId,
                        schema.WorkspaceSchema.companyId,
                    ),
                    eq(schema.UserCompanyPermissionSchema.userId, schema.UserSchema.id),
                ),
            )
            .leftJoin(
                companyPermission,
                eq(companyPermission.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId))

        // users with company permission but NO workspace permission
        const groupB = await this.db
            .select({
                id: schema.UserSchema.id,
                fullname: schema.UserSchema.fullname,
                username: schema.UserSchema.username,
                email: schema.UserSchema.email,
                avatarUrl: schema.UserSchema.avatarUrl,
                workspacePermissionId: sql<number | null>`null`,
                workspacePermissionName: sql<string | null>`null`,
                companyPermissionId: companyPermission.id,
                companyPermissionName: companyPermission.name,
            })
            .from(schema.UserCompanyPermissionSchema)
            .innerJoin(
                schema.UserSchema,
                eq(schema.UserSchema.id, schema.UserCompanyPermissionSchema.userId),
            )
            .innerJoin(
                schema.WorkspaceSchema,
                eq(schema.WorkspaceSchema.companyId, schema.UserCompanyPermissionSchema.companyId),
            )
            .innerJoin(
                companyPermission,
                eq(companyPermission.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                and(
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                    eq(
                        schema.UserWorkspacePermissionSchema.userId,
                        schema.UserCompanyPermissionSchema.userId,
                    ),
                ),
            )
            .where(
                and(
                    eq(schema.WorkspaceSchema.id, workspaceId),
                    isNull(schema.UserWorkspacePermissionSchema.userId),
                ),
            )

        return [...groupA, ...groupB]
    }

    async getWorkspaceProjects(workspaceId: string): Promise<ProjectNavigationSummary[]> {
        return this.db
            .select({
                id: schema.ProjectSchema.id,
                name: schema.ProjectSchema.name,
                slug: schema.ProjectSchema.slug,
                companySlug: schema.CompanySchema.slug,
                workspaceSlug: schema.WorkspaceSchema.slug,
                workspaceName: schema.WorkspaceSchema.name,
            })
            .from(schema.ProjectSchema)
            .innerJoin(
                schema.CompanySchema,
                eq(schema.CompanySchema.id, schema.ProjectSchema.companyId),
            )
            .leftJoin(
                schema.WorkspaceSchema,
                eq(schema.WorkspaceSchema.id, schema.ProjectSchema.workspaceId),
            )
    }

    async doesUserHaveSufficientWorkspacePermissionOrFail(
        workspaceId: string,
        userId: string,
        permissionLevel: number,
    ): Promise<void> {
        const [workspacePermission] = await this.db
            .select({ level: schema.PermissionSchema.level })
            .from(schema.UserWorkspacePermissionSchema)
            .innerJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserWorkspacePermissionSchema.permissionId),
            )
            .where(
                and(
                    eq(schema.UserWorkspacePermissionSchema.userId, userId),
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                ),
            )
            .limit(1)

        if (workspacePermission && workspacePermission.level >= permissionLevel) return

        const [workspace] = await this.db
            .select({ companyId: schema.WorkspaceSchema.companyId })
            .from(schema.WorkspaceSchema)
            .where(eq(schema.WorkspaceSchema.id, workspaceId))
            .limit(1)

        if (!workspace) throw new NotFoundException('Workspace not found')

        const [companyPermission] = await this.db
            .select({ level: schema.PermissionSchema.level })
            .from(schema.UserCompanyPermissionSchema)
            .innerJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(
                and(
                    eq(schema.UserCompanyPermissionSchema.companyId, workspace.companyId),
                    eq(schema.UserCompanyPermissionSchema.userId, userId),
                ),
            )
            .limit(1)

        if (!companyPermission || companyPermission.level < permissionLevel) {
            throw new ForbiddenException('Insufficient permissions')
        }
    }
}
