import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
    CreateProjectDto,
    PERMISSION,
    ProjectDetails,
    ProjectMember,
    ProjectNavigationSummary,
    ProjectRowDto,
} from '@shared/validations'
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { alias } from 'drizzle-orm/pg-core'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'
import { CompanyService } from '../company/company.service'
import { WorkspaceService } from '../workspace/workspace.service'

@Injectable()
export class ProjectService {
    constructor(
        @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
        private readonly workspaceService: WorkspaceService,
        private readonly companyService: CompanyService,
    ) {}

    async createProject(userId: string, dto: CreateProjectDto): Promise<ProjectRowDto> {
        await this.checkForPermissions(userId, dto.companyId, dto.workspaceId)
        const [project] = await this.db
            .insert(schema.ProjectSchema)
            .values({ ...dto, createdBy: userId })
            .returning()
        return project
    }

    async getUserProjects(userId: string): Promise<ProjectNavigationSummary[]> {
        return this.db
            .select({
                name: schema.ProjectSchema.name,
                slug: schema.ProjectSchema.slug,
                id: schema.ProjectSchema.id,
                companySlug: schema.CompanySchema.slug,
                workspaceSlug: schema.WorkspaceSchema.slug,
                workspaceName: schema.WorkspaceSchema.name,
            })
            .from(schema.ProjectSchema)
            .innerJoin(
                schema.CompanyMemberSchema,
                eq(schema.ProjectSchema.companyId, schema.CompanyMemberSchema.companyId),
            )
            .innerJoin(
                schema.CompanySchema,
                eq(schema.CompanySchema.id, schema.ProjectSchema.companyId),
            )
            .leftJoin(
                schema.WorkspaceSchema,
                eq(schema.WorkspaceSchema.id, schema.ProjectSchema.workspaceId),
            )
            .where(eq(schema.CompanyMemberSchema.userId, userId))
    }

    async getProjectBySlugOrFail(projectSlug: string): Promise<ProjectRowDto> {
        const [project] = await this.db
            .select({
                ...getTableColumns(schema.ProjectSchema),
                company: schema.CompanySchema,
                workspace: schema.WorkspaceSchema,
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
            .where(eq(schema.ProjectSchema.slug, projectSlug))
            .limit(1)

        if (!project) throw new NotFoundException('Project not found')

        return project
    }

    async getProjectDetails(projectSlug: string, userId: string): Promise<ProjectDetails> {
        const project = await this.getProjectBySlugOrFail(projectSlug)
        const currentUserEffectivePermission =
            await this.doesUserHaveSufficientProjectPermissionOrFail(
                project,
                userId,
                PERMISSION.maintainer.level,
            )

        const members = await this.getProjectMembers(project)

        return { project, members, currentUserEffectivePermission }
    }

    async doesUserHaveSufficientProjectPermissionOrFail(
        project: ProjectRowDto,
        userId: string,
        permissionLevel: number,
    ): Promise<number> {
        const [projectPermission] = await this.db
            .select({ level: schema.PermissionSchema.level })
            .from(schema.UserProjectPermissionSchema)
            .innerJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserProjectPermissionSchema.permissionId),
            )
            .where(
                and(
                    eq(schema.UserProjectPermissionSchema.userId, userId),
                    eq(schema.UserProjectPermissionSchema.projectId, project.id),
                ),
            )
            .limit(1)

        if (projectPermission && projectPermission.level >= permissionLevel)
            return projectPermission.level

        if (project.workspaceId) {
            const [workspacePermission] = await this.db
                .select({ level: schema.PermissionSchema.level })
                .from(schema.UserWorkspacePermissionSchema)
                .innerJoin(
                    schema.PermissionSchema,
                    eq(
                        schema.PermissionSchema.id,
                        schema.UserWorkspacePermissionSchema.permissionId,
                    ),
                )
                .where(
                    and(
                        eq(schema.UserWorkspacePermissionSchema.userId, userId),
                        eq(schema.UserWorkspacePermissionSchema.workspaceId, project.workspaceId),
                    ),
                )
                .limit(1)

            if (workspacePermission && workspacePermission.level >= permissionLevel)
                return workspacePermission.level
        }

        const [companyPermission] = await this.db
            .select({ level: schema.PermissionSchema.level })
            .from(schema.UserCompanyPermissionSchema)
            .innerJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(
                and(
                    eq(schema.UserCompanyPermissionSchema.companyId, project.companyId),
                    eq(schema.UserCompanyPermissionSchema.userId, userId),
                ),
            )
            .limit(1)

        if (!companyPermission || companyPermission.level < permissionLevel) {
            throw new ForbiddenException('Insufficient permissions')
        }

        return companyPermission.level
    }

    async getProjectMembers(project: ProjectRowDto): Promise<ProjectMember[]> {
        const projectPerm = alias(schema.PermissionSchema, 'project_permission')
        const workspacePerm = alias(schema.PermissionSchema, 'workspace_permission')
        const companyPerm = alias(schema.PermissionSchema, 'company_permission')

        // GroupA: users with explicit project permission
        const groupA = (await this.db
            .select({
                id: schema.UserSchema.id,
                fullname: schema.UserSchema.fullname,
                username: schema.UserSchema.username,
                email: schema.UserSchema.email,
                avatarUrl: schema.UserSchema.avatarUrl,
                projectPermissionId: projectPerm.id,
                projectPermissionName: projectPerm.name,
                workspacePermissionId: workspacePerm.id,
                workspacePermissionName: workspacePerm.name,
                companyPermissionId: companyPerm.id,
                companyPermissionName: companyPerm.name,
            })
            .from(schema.UserProjectPermissionSchema)
            .innerJoin(
                schema.UserSchema,
                eq(schema.UserSchema.id, schema.UserProjectPermissionSchema.userId),
            )
            .innerJoin(
                projectPerm,
                eq(projectPerm.id, schema.UserProjectPermissionSchema.permissionId),
            )
            .leftJoin(schema.ProjectSchema, eq(schema.ProjectSchema.id, project.id))
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                and(
                    eq(
                        schema.UserWorkspacePermissionSchema.workspaceId,
                        schema.ProjectSchema.workspaceId,
                    ),
                    eq(schema.UserWorkspacePermissionSchema.userId, schema.UserSchema.id),
                ),
            )
            .leftJoin(
                workspacePerm,
                eq(workspacePerm.id, schema.UserWorkspacePermissionSchema.permissionId),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                and(
                    eq(
                        schema.UserCompanyPermissionSchema.companyId,
                        schema.ProjectSchema.companyId,
                    ),
                    eq(schema.UserCompanyPermissionSchema.userId, schema.UserSchema.id),
                ),
            )
            .leftJoin(
                companyPerm,
                eq(companyPerm.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(eq(schema.UserProjectPermissionSchema.projectId, project.id))) as ProjectMember[]

        // GroupB: workspace permission but no project permission (only if project belongs to a workspace)
        let groupB: ProjectMember[] = []
        if (project.workspaceId) {
            groupB = (await this.db
                .select({
                    id: schema.UserSchema.id,
                    fullname: schema.UserSchema.fullname,
                    username: schema.UserSchema.username,
                    email: schema.UserSchema.email,
                    avatarUrl: schema.UserSchema.avatarUrl,
                    projectPermissionId: sql<number | null>`null`,
                    projectPermissionName: sql<string | null>`null`,
                    workspacePermissionId: workspacePerm.id,
                    workspacePermissionName: workspacePerm.name,
                    companyPermissionId: companyPerm.id,
                    companyPermissionName: companyPerm.name,
                })
                .from(schema.UserWorkspacePermissionSchema)
                .innerJoin(
                    schema.UserSchema,
                    eq(schema.UserSchema.id, schema.UserWorkspacePermissionSchema.userId),
                )
                .innerJoin(
                    workspacePerm,
                    eq(workspacePerm.id, schema.UserWorkspacePermissionSchema.permissionId),
                )
                .leftJoin(
                    schema.WorkspaceSchema,
                    eq(schema.WorkspaceSchema.id, project.workspaceId),
                )
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
                    companyPerm,
                    eq(companyPerm.id, schema.UserCompanyPermissionSchema.permissionId),
                )
                .leftJoin(
                    schema.UserProjectPermissionSchema,
                    and(
                        eq(schema.UserProjectPermissionSchema.projectId, project.id),
                        eq(schema.UserProjectPermissionSchema.userId, schema.UserSchema.id),
                    ),
                )
                .where(
                    and(
                        eq(schema.UserWorkspacePermissionSchema.workspaceId, project.workspaceId),
                        isNull(schema.UserProjectPermissionSchema.userId),
                    ),
                )) as ProjectMember[]
        }

        // GroupC: company permission only (no project or workspace permission)
        const groupC = (await this.db
            .select({
                id: schema.UserSchema.id,
                fullname: schema.UserSchema.fullname,
                username: schema.UserSchema.username,
                email: schema.UserSchema.email,
                avatarUrl: schema.UserSchema.avatarUrl,
                projectPermissionId: sql<number | null>`null`,
                projectPermissionName: sql<string | null>`null`,
                workspacePermissionId: sql<number | null>`null`,
                workspacePermissionName: sql<string | null>`null`,
                companyPermissionId: companyPerm.id,
                companyPermissionName: companyPerm.name,
            })
            .from(schema.UserCompanyPermissionSchema)
            .innerJoin(
                schema.UserSchema,
                eq(schema.UserSchema.id, schema.UserCompanyPermissionSchema.userId),
            )
            .innerJoin(
                companyPerm,
                eq(companyPerm.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .leftJoin(
                schema.UserProjectPermissionSchema,
                and(
                    eq(schema.UserProjectPermissionSchema.projectId, project.id),
                    eq(schema.UserProjectPermissionSchema.userId, schema.UserSchema.id),
                ),
            )
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                project.workspaceId
                    ? and(
                          eq(schema.UserWorkspacePermissionSchema.workspaceId, project.workspaceId),
                          eq(schema.UserWorkspacePermissionSchema.userId, schema.UserSchema.id),
                      )
                    : undefined,
            )
            .where(
                and(
                    eq(schema.UserCompanyPermissionSchema.companyId, project.companyId),
                    isNull(schema.UserProjectPermissionSchema.userId),
                    isNull(schema.UserWorkspacePermissionSchema.userId),
                ),
            )) as ProjectMember[]

        return [...groupA, ...groupB, ...groupC]
    }

    async checkForPermissions(
        userId: string,
        companyId: string,
        workspaceId?: string,
    ): Promise<void> {
        if (workspaceId) {
            const workspaceLevelPermission =
                await this.workspaceService.getUserWorkspaceLevelPermissionsLevel(
                    userId,
                    workspaceId,
                )

            if (!workspaceLevelPermission || workspaceLevelPermission < PERMISSION.admin.level)
                throw new ForbiddenException('Not high enough permission to use workspace')
        }
        const companyLevelPermission = await this.companyService.getUserCompanyLevelPermissionLevel(
            userId,
            companyId,
        )
        if (!companyLevelPermission || companyLevelPermission < PERMISSION.admin.level)
            throw new ForbiddenException('Not high enough permission to use workspace')
    }
}
