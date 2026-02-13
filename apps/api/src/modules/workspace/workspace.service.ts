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
import { CompanyService } from '../company/company.service'

@Injectable()
export class WorkspaceService {
    constructor(
        @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
        private readonly companyService: CompanyService,
    ) {}

    async createWorkspace(dto: CreateWorkspaceDto, userId: string): Promise<WorkspaceRowDto> {
        const userCompanyLevelPermissionLevel =
            await this.companyService.getUserCompanyLevelPermissionLevel(userId, dto.companyId)

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
                workspacePerm,
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
                companyPerm,
                eq(schema.UserCompanyPermissionSchema.permissionId, schema.PermissionSchema.id),
            )
            .where(
                or(
                    gte(workspacePerm.level, PERMISSION.ADMIN.level),
                    gte(companyPerm.level, PERMISSION.ADMIN.level),
                ),
            )
    }

    async getUserWorkspaceLevelPermissionsLevel(
        userId: string,
        workspaceId: string,
    ): Promise<number | null> {
        const workspacePerm = alias(schema.PermissionSchema, 'workspacePerm')
        const companyPerm = alias(schema.PermissionSchema, 'companyPerm')

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
}
