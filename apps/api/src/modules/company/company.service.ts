import { Inject, Injectable } from '@nestjs/common'
import { CompanyRowDto, CreateCompanyDto } from '@shared/validations'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class CompanyService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async createCompany(dto: CreateCompanyDto): Promise<CompanyRowDto> {
        const [company] = await this.db
            .insert(schema.CompanySchema)
            .values({ ...dto })
            .returning()

        return company
    }
}
