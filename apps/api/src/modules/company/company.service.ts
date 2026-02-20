import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
    CompanyDetails,
    CompanyMembers,
    CompanyRowDto,
    CompanyStats,
    CreateCompanyDto,
    EditCompanyDto,
    PERMISSION,
    ProjectSummary,
    UserCompanySummary,
    WorkspaceSummary,
} from '@shared/validations'
import { and, eq, gte, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { alias } from 'drizzle-orm/pg-core'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class CompanyService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async getCompanyByIdOrFail(companyId: string): Promise<CompanyRowDto> {
        const [company] = await this.db
            .select()
            .from(schema.CompanySchema)
            .where(eq(schema.CompanySchema.id, companyId))
            .limit(1)

        if (!company) {
            throw new NotFoundException('Company Not Found')
        }

        return company
    }

    async getCompanyBySlugOrFail(companySlug: string): Promise<CompanyRowDto> {
        const [company] = await this.db
            .select()
            .from(schema.CompanySchema)
            .where(eq(schema.CompanySchema.slug, companySlug))
            .limit(1)

        if (!company) throw new NotFoundException('Company Not Found')

        return company
    }

    async createCompany(userId: string, dto: CreateCompanyDto): Promise<CompanyRowDto> {
        return this.db.transaction(async tx => {
            const [company] = await tx
                .insert(schema.CompanySchema)
                .values({ ...dto, createdBy: userId })
                .returning()

            await tx.insert(schema.CompanyMemberSchema).values({
                companyId: company.id,
                userId: userId,
            })

            await tx.insert(schema.UserCompanyPermissionSchema).values({
                userId: userId,
                companyId: company.id,
                permissionId: PERMISSION.owner.id,
            })
            return company
        })
    }

    async editCompany(
        userId: string,
        companyId: string,
        dto: EditCompanyDto,
    ): Promise<CompanyRowDto> {
        await this.doesUserHavePermissionOrFail(companyId, userId, PERMISSION.admin.level)

        const [updated] = await this.db
            .update(schema.CompanySchema)
            .set({ ...dto })
            .where(eq(schema.CompanySchema.id, companyId))
            .returning()

        return updated
    }

    async getCompanyDetails(companySlug: string, userId: string): Promise<CompanyDetails> {
        const company = await this.getCompanyBySlugOrFail(companySlug)
        await this.doesUserHavePermissionOrFail(company.id, userId, PERMISSION.maintainer.level)

        const [stats, workspaces, members, companyProjects] = await Promise.all([
            this.getCompanyStats(company.id),
            this.getCompanyWorkspaces(company.id),
            this.getCompanyMembers(company.id),
            this.getCompanyProjects(company.id),
        ])

        return {
            company,
            stats,
            workspaces,
            members,
            companyProjects,
        }
    }

    async getManageableCompaniesForUser(userId: string): Promise<UserCompanySummary[]> {
        return this.db
            .select({
                name: schema.CompanySchema.name,
                slug: schema.CompanySchema.slug,
                id: schema.CompanySchema.id,
            })
            .from(schema.CompanyMemberSchema)
            .innerJoin(
                schema.CompanySchema,
                eq(schema.CompanySchema.id, schema.CompanyMemberSchema.companyId),
            )
            .innerJoin(
                schema.UserCompanyPermissionSchema,
                eq(schema.CompanySchema.id, schema.UserCompanyPermissionSchema.companyId),
            )
            .innerJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(
                and(
                    eq(schema.CompanyMemberSchema.userId, userId),
                    gte(schema.PermissionSchema.level, PERMISSION.admin.level),
                ),
            )
    }

    async getViewableCompaniesForUser(userId: string): Promise<UserCompanySummary[]> {
        return this.db
            .select({
                name: schema.CompanySchema.name,
                slug: schema.CompanySchema.slug,
                id: schema.CompanySchema.id,
            })
            .from(schema.CompanyMemberSchema)
            .innerJoin(
                schema.CompanySchema,
                eq(schema.CompanySchema.id, schema.CompanyMemberSchema.companyId),
            )
            .innerJoin(
                schema.UserCompanyPermissionSchema,
                eq(schema.CompanySchema.id, schema.UserCompanyPermissionSchema.companyId),
            )
            .where(eq(schema.CompanyMemberSchema.userId, userId))
    }

    async getUserCompanyLevelPermissionLevel(
        userId: string,
        companyId: string,
    ): Promise<number | null> {
        const [permission] = await this.db
            .select({
                level: schema.PermissionSchema.level,
            })
            .from(schema.PermissionSchema)
            .innerJoin(
                schema.UserCompanyPermissionSchema,
                eq(schema.UserCompanyPermissionSchema.permissionId, schema.PermissionSchema.id),
            )
            .where(
                and(
                    eq(schema.UserCompanyPermissionSchema.companyId, companyId),
                    eq(schema.UserCompanyPermissionSchema.userId, userId),
                ),
            )
            .limit(1)

        return permission?.level ?? null
    }

    async doesUserHavePermissionOrFail(companyId: string, userId: string, permissionLevel: number) {
        const [member] = await this.db
            .select({
                permissionLevel: schema.PermissionSchema.level,
            })
            .from(schema.UserCompanyPermissionSchema)
            .innerJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(
                and(
                    eq(schema.UserCompanyPermissionSchema.companyId, companyId),
                    eq(schema.UserCompanyPermissionSchema.userId, userId),
                ),
            )

        if (!member) throw new NotFoundException('Company not found')
        if (member.permissionLevel < permissionLevel)
            throw new ForbiddenException('Not high enough permission')
    }

    async getCompanyStats(companyId: string): Promise<CompanyStats> {
        const [stats] = await this.db
            .select({
                memberCount: sql<number>`count(distinct ${schema.CompanyMemberSchema.userId})`,
                workspaceCount: sql<number>`count(distinct ${schema.WorkspaceSchema.id})`,
                projectCount: sql<number>`count(distinct ${schema.ProjectSchema.id})`,
            })
            .from(schema.CompanySchema)
            .leftJoin(
                schema.CompanyMemberSchema,
                eq(schema.CompanySchema.id, schema.CompanyMemberSchema.companyId),
            )
            .leftJoin(
                schema.WorkspaceSchema,
                eq(schema.CompanySchema.id, schema.WorkspaceSchema.companyId),
            )
            .leftJoin(
                schema.ProjectSchema,
                eq(schema.CompanySchema.id, schema.ProjectSchema.companyId),
            )
            .where(eq(schema.CompanySchema.id, companyId))

        return stats
    }

    async getCompanyWorkspaces(companyId: string): Promise<WorkspaceSummary[]> {
        const workspacePermission = alias(schema.PermissionSchema, 'workspace_permission')
        const companyPermission = alias(schema.PermissionSchema, 'company_permission')
        const workspaces = await this.db
            .select({
                id: schema.WorkspaceSchema.id,
                name: schema.WorkspaceSchema.name,
                slug: schema.WorkspaceSchema.slug,
                projectCount: sql<number>`count(distinct ${schema.ProjectSchema.id})`,
                memberCount: sql<number>`count(distinct CASE 
                    WHEN ${workspacePermission.level} >= 2 THEN ${schema.UserWorkspacePermissionSchema.userId}
                    WHEN ${companyPermission.level} >=2 THEN ${schema.UserCompanyPermissionSchema.userId}
                    ELSE NULL
                    END)`,
            })
            .from(schema.WorkspaceSchema)
            .leftJoin(
                schema.ProjectSchema,
                eq(schema.WorkspaceSchema.id, schema.ProjectSchema.workspaceId),
            )
            .leftJoin(
                schema.UserWorkspacePermissionSchema,
                eq(schema.WorkspaceSchema.id, schema.UserWorkspacePermissionSchema.workspaceId),
            )
            .leftJoin(
                workspacePermission,
                eq(schema.UserWorkspacePermissionSchema.permissionId, workspacePermission.id),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                eq(schema.WorkspaceSchema.companyId, schema.UserCompanyPermissionSchema.companyId),
            )
            .leftJoin(
                companyPermission,
                eq(schema.UserCompanyPermissionSchema.permissionId, companyPermission.id),
            )
            .where(eq(schema.WorkspaceSchema.companyId, companyId))
            .groupBy(schema.WorkspaceSchema.id)

        return workspaces
    }

    async getCompanyMembers(companyId: string): Promise<CompanyMembers[]> {
        const members = await this.db
            .select({
                id: schema.UserSchema.id,
                fullname: schema.UserSchema.fullname,
                username: schema.UserSchema.username,
                email: schema.UserSchema.email,
                permissionName: schema.PermissionSchema.name,
                permissionId: schema.PermissionSchema.id,
            })
            .from(schema.CompanyMemberSchema)
            .innerJoin(
                schema.UserSchema,
                eq(schema.UserSchema.id, schema.CompanyMemberSchema.userId),
            )
            .leftJoin(
                schema.UserCompanyPermissionSchema,
                and(
                    eq(
                        schema.UserCompanyPermissionSchema.userId,
                        schema.CompanyMemberSchema.userId,
                    ),
                    eq(
                        schema.UserCompanyPermissionSchema.companyId,
                        schema.CompanyMemberSchema.companyId,
                    ),
                ),
            )
            .leftJoin(
                schema.PermissionSchema,
                eq(schema.PermissionSchema.id, schema.UserCompanyPermissionSchema.permissionId),
            )
            .where(eq(schema.CompanyMemberSchema.companyId, companyId))

        return members
    }

    async getCompanyProjects(companyId: string): Promise<ProjectSummary[]> {
        const projects = await this.db
            .select({
                id: schema.ProjectSchema.id,
                name: schema.ProjectSchema.name,
                slug: schema.ProjectSchema.slug,
            })
            .from(schema.ProjectSchema)
            .where(eq(schema.ProjectSchema.companyId, companyId))

        return projects
    }
}
