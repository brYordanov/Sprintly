import { Inject, Injectable } from '@nestjs/common'
import { CreateProjectDto, ProjectRowDto } from '@shared/validations'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class ProjectService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async createProject(dto: CreateProjectDto): Promise<ProjectRowDto> {
        const [project] = await this.db.insert(schema.ProjectSchema).values(dto).returning()
        return project
    }

    async getUserProjects(userId: string) {
        return this.db
            .select({
                name: schema.ProjectSchema.name,
                slug: schema.ProjectSchema.slug,
                id: schema.ProjectSchema.id,
            })
            .from(schema.ProjectSchema)
            .innerJoin(
                schema.CompanyMemberSchema,
                eq(schema.ProjectSchema.companyId, schema.CompanyMemberSchema.companyId),
            )
            .where(eq(schema.CompanyMemberSchema.userId, userId))
    }
}
