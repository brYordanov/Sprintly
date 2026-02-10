import { Inject, Injectable } from '@nestjs/common'
import { CompanyRowDto, CreateCompanyDto } from '@shared/validations'
import { eq, or } from 'drizzle-orm'
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
            return company
        })
    }

    async getUserCompanies(userId: string) {
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
            .where(
                or(
                    eq(schema.CompanyMemberSchema.userId, userId),
                    eq(schema.CompanySchema.ownerId, userId),
                ),
            )
    }
}
