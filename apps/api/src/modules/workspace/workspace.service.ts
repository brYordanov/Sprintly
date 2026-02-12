import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import {
    CreateWorkspaceDto,
    PERMISSION,
    UserWorkspaceSummary,
    WorkspaceRowDto,
} from '@shared/validations'
import { and, eq, gte, or } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { alias } from 'drizzle-orm/pg-core'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class WorkspaceService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async createWorkspace(dto: CreateWorkspaceDto, userId: string): Promise<WorkspaceRowDto> {
        const userCompanyLevelPermissionLevel = await this.getUserCompanyLevelPermissionLevel(
            userId,
            dto.companyId,
        )

        if (!userCompanyLevelPermissionLevel || userCompanyLevelPermissionLevel < 3)
            throw new ForbiddenException('Insufficient permissions')

        const [workspace] = await this.db.insert(schema.WorkspaceSchema).values(dto).returning()
        return workspace
    }

    async getViewableUserWorkspaces(userId: string): Promise<UserWorkspaceSummary[]> {
        return this.db
            .select({
                name: schema.WorkspaceSchema.name,
                slug: schema.WorkspaceSchema.slug,
                id: schema.WorkspaceSchema.id,
            })
            .from(schema.WorkspaceSchema)
            .innerJoin(
                schema.CompanyMemberSchema,
                eq(schema.WorkspaceSchema.companyId, schema.CompanyMemberSchema.companyId),
            )
            .where(eq(schema.CompanyMemberSchema.userId, userId))
    }

    async getManageableUserWorkspaces(userId: string): Promise<UserWorkspaceSummary[]> {
        const workspacePerm = alias(schema.PermissionSchema, 'workspacePerm')
        const companyPerm = alias(schema.PermissionSchema, 'companyPerm')
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
                alias(schema.PermissionSchema, 'workspacePerm'),
                eq(schema.UserWorkspacePermissionSchema.permissionId, schema.PermissionSchema.id),
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
                alias(schema.PermissionSchema, 'companyPerm'),
                eq(schema.UserCompanyPermissionSchema.permissionId, schema.PermissionSchema.id),
            )
            .where(
                or(
                    gte(workspacePerm.level, PERMISSION.ADMIN.level),
                    gte(companyPerm.level, PERMISSION.ADMIN.level),
                ),
            )
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
}
