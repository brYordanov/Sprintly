import { Inject, Injectable } from '@nestjs/common'
import { CreateWorkspaceDto, WorkspaceRowDto } from '@shared/validations'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class WorkspaceService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceRowDto> {
        const [workspace] = await this.db.insert(schema.WorkspaceSchema).values(dto).returning()
        return workspace
    }

    async getUserWorkspaces(userId: string) {
        return this.db
            .select({
                name: schema.WorkspaceSchema.name,
                slug: schema.WorkspaceSchema.slug,
                id: schema.WorkspaceSchema.id,
            })
            .from(schema.CompanyMemberSchema)
            .innerJoin(
                schema.WorkspaceSchema,
                eq(schema.WorkspaceSchema.companyId, schema.CompanyMemberSchema.companyId),
            )
            .where(eq(schema.CompanyMemberSchema.userId, userId))
    }
}
