import {
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import {
    CreateWorkspaceDto,
    EditWorkspaceDto,
    PERMISSION,
    ProjectNavigationSummary,
    UserWorkspaceNavigationSummary,
    UserWorkspaceSummary,
    WorkspaceMember,
    WorkspaceNonMember,
    WorkspaceRowDto,
} from '@shared/validations'
import { and, eq, gt, gte, ilike, isNull, lt, or, sql } from 'drizzle-orm'
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

    async getWorkspaceWithCompanyBySlugOrFail(workspaceSlug: string): Promise<WorkspaceRowDto> {
        const [workspace] = await this.db
            .select()
            .from(schema.WorkspaceSchema)
            .where(eq(schema.WorkspaceSchema.slug, workspaceSlug))
            .limit(1)

        if (!workspace) throw new NotFoundException('Workspace not found')

        const [company] = await this.db
            .select()
            .from(schema.CompanySchema)
            .where(eq(schema.CompanySchema.id, workspace.companyId))
            .limit(1)

        return { ...workspace, company }
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
        const workspace = await this.getWorkspaceWithCompanyBySlugOrFail(workspaceSlug)
        await this.doesUserHaveSufficientWorkspacePermissionOrFail(
            workspace.id,
            userId,
            PERMISSION.maintainer.level,
        )

        const [members, workspaceProjects] = await Promise.all([
            this.getWorkspaceMembers(workspace.id),
            this.getWorkspaceProjects(workspace.id),
        ])

        return { workspace, members, workspaceProjects }
    }

    async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
        const workspacePermission = alias(schema.PermissionSchema, 'workspace_permission')
        const companyPermission = alias(schema.PermissionSchema, 'company_permission')

        // users with explicit workspace permission, also fetch their company permission
        const groupA = (await this.db
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
            .where(
                eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
            )) as WorkspaceMember[]

        // users with company permission but NO workspace permission
        const groupB = (await this.db
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
                    gt(companyPermission.level, PERMISSION.guest.level),
                ),
            )) as WorkspaceMember[]

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
            .where(eq(schema.ProjectSchema.workspaceId, workspaceId))
    }

    async getWorkspaceByIdOrFail(workspaceId: string) {
        const [workspace] = await this.db
            .select()
            .from(schema.WorkspaceSchema)
            .where(eq(schema.WorkspaceSchema.id, workspaceId))
            .limit(1)

        if (!workspace) throw new NotFoundException('Workspace not found')

        return workspace
    }

    async editWorkspace(
        userId: string,
        workspaceId: string,
        dto: EditWorkspaceDto,
    ): Promise<WorkspaceRowDto> {
        await this.doesUserHaveSufficientWorkspacePermissionOrFail(
            workspaceId,
            userId,
            PERMISSION.admin.level,
        )

        const [updated] = await this.db
            .update(schema.WorkspaceSchema)
            .set({ ...dto })
            .where(eq(schema.WorkspaceSchema.id, workspaceId))
            .returning()

        return updated
    }

    async searchNonMembers(workspaceId: string, query: string): Promise<WorkspaceNonMember[]> {
        const q = `%${query}%`
        const workspace = await this.getWorkspaceByIdOrFail(workspaceId)
        const companyPermission = alias(schema.PermissionSchema, 'company_permission')

        return this.db
            .select({
                id: schema.UserSchema.id,
                fullname: schema.UserSchema.fullname,
                username: schema.UserSchema.username,
                email: schema.UserSchema.email,
                avatarUrl: schema.UserSchema.avatarUrl,
            })
            .from(schema.UserSchema)
            .innerJoin(
                schema.CompanyMemberSchema,
                and(
                    eq(schema.CompanyMemberSchema.userId, schema.UserSchema.id),
                    eq(schema.CompanyMemberSchema.companyId, workspace.companyId),
                ),
            )
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                and(
                    eq(schema.UserWorkspacePermissionSchema.userId, schema.UserSchema.id),
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                ),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                and(
                    eq(schema.UserCompanyPermissionSchema.userId, schema.UserSchema.id),
                    eq(schema.UserCompanyPermissionSchema.companyId, workspace.companyId),
                ),
            )
            .leftJoin(
                companyPermission,
                eq(companyPermission.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(
                and(
                    isNull(schema.UserWorkspacePermissionSchema.userId),
                    or(
                        ilike(schema.UserSchema.fullname, q),
                        ilike(schema.UserSchema.username, q),
                        ilike(schema.UserSchema.email, q),
                    ),
                    or(
                        isNull(schema.UserCompanyPermissionSchema.userId),
                        lt(companyPermission.level, PERMISSION.admin.level),
                    ),
                ),
            )
    }

    async addMembers(
        workspaceId: string,
        members: { userId: string; permissionId: number }[],
    ): Promise<WorkspaceMember[]> {
        return Promise.all(
            members.map(async ({ userId, permissionId }) => {
                const [existing] = await this.db
                    .select()
                    .from(schema.UserWorkspacePermissionSchema)
                    .where(
                        and(
                            eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                            eq(schema.UserWorkspacePermissionSchema.userId, userId),
                        ),
                    )
                    .limit(1)

                if (existing)
                    throw new ConflictException(`User ${userId} already has a workspace permission`)

                await this.db
                    .insert(schema.UserWorkspacePermissionSchema)
                    .values({ workspaceId, userId, permissionId })

                const [result] = await this.db
                    .select({
                        id: schema.UserSchema.id,
                        fullname: schema.UserSchema.fullname,
                        username: schema.UserSchema.username,
                        email: schema.UserSchema.email,
                        avatarUrl: schema.UserSchema.avatarUrl,
                        workspacePermissionId: schema.PermissionSchema.id,
                        workspacePermissionName: schema.PermissionSchema.name,
                    })
                    .from(schema.UserSchema)
                    .innerJoin(
                        schema.UserWorkspacePermissionSchema,
                        and(
                            eq(schema.UserWorkspacePermissionSchema.userId, schema.UserSchema.id),
                            eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                        ),
                    )
                    .innerJoin(
                        schema.PermissionSchema,
                        eq(
                            schema.PermissionSchema.id,
                            schema.UserWorkspacePermissionSchema.permissionId,
                        ),
                    )
                    .where(eq(schema.UserSchema.id, userId))
                    .limit(1)

                return {
                    ...result,
                    companyPermissionId: null,
                    companyPermissionName: null,
                } as WorkspaceMember
            }),
        )
    }

    async changeWorkspaceMemberPermission(
        requestingUserId: string,
        workspaceId: string,
        targetUserId: string,
        permissionId: number,
    ): Promise<WorkspaceMember> {
        await this.doesUserHaveSufficientWorkspacePermissionOrFail(
            workspaceId,
            requestingUserId,
            PERMISSION.admin.level,
        )

        const [existing] = await this.db
            .select()
            .from(schema.UserWorkspacePermissionSchema)
            .where(
                and(
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                    eq(schema.UserWorkspacePermissionSchema.userId, targetUserId),
                ),
            )
            .limit(1)

        if (existing) {
            await this.db
                .update(schema.UserWorkspacePermissionSchema)
                .set({ permissionId })
                .where(
                    and(
                        eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                        eq(schema.UserWorkspacePermissionSchema.userId, targetUserId),
                    ),
                )
        } else {
            await this.db
                .insert(schema.UserWorkspacePermissionSchema)
                .values({ workspaceId, userId: targetUserId, permissionId })
        }

        const workspacePermission = alias(schema.PermissionSchema, 'workspace_permission')
        const companyPermission = alias(schema.PermissionSchema, 'company_permission')

        const [result] = await this.db
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
            .from(schema.UserSchema)
            .innerJoin(
                schema.UserWorkspacePermissionSchema,
                and(
                    eq(schema.UserWorkspacePermissionSchema.userId, schema.UserSchema.id),
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                ),
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
            .where(eq(schema.UserSchema.id, targetUserId))
            .limit(1)

        return result as WorkspaceMember
    }

    async removeMember(
        requestingUserId: string,
        workspaceId: string,
        targetUserId: string,
    ): Promise<void> {
        await this.doesUserHaveSufficientWorkspacePermissionOrFail(
            workspaceId,
            requestingUserId,
            PERMISSION.admin.level,
        )

        const [existing] = await this.db
            .select()
            .from(schema.UserWorkspacePermissionSchema)
            .where(
                and(
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                    eq(schema.UserWorkspacePermissionSchema.userId, targetUserId),
                ),
            )
            .limit(1)

        if (!existing)
            throw new NotFoundException('User does not have a workspace-level permission')

        await this.db
            .delete(schema.UserWorkspacePermissionSchema)
            .where(
                and(
                    eq(schema.UserWorkspacePermissionSchema.workspaceId, workspaceId),
                    eq(schema.UserWorkspacePermissionSchema.userId, targetUserId),
                ),
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
