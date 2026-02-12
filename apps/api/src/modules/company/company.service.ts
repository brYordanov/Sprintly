import { Inject, Injectable } from '@nestjs/common'
import {
    CompanyRowDto,
    CreateCompanyDto,
    PERMISSION,
    UserCompanySummary,
} from '@shared/validations'
import { and, eq, gte } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class CompanyService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async createCompany(userId: string, dto: CreateCompanyDto): Promise<CompanyRowDto> {
        return this.db.transaction(async tx => {
            const [company] = await tx
                .insert(schema.CompanySchema)
                .values({ ...dto, ownerId: userId })
                .returning()

            await tx.insert(schema.CompanyMemberSchema).values({
                companyId: company.id,
                userId: userId,
            })

            await tx.insert(schema.UserCompanyPermissionSchema).values({
                userId: userId,
                companyId: company.id,
                permissionId: PERMISSION.OWNER.id,
            })
            return company
        })
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
            .where(
                and(
                    eq(schema.CompanyMemberSchema.userId, userId),
                    gte(schema.PermissionSchema.level, PERMISSION.ADMIN.level),
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
}
