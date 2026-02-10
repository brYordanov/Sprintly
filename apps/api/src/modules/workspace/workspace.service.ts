import { Inject, Injectable } from '@nestjs/common'
import { CreateWorkspaceDto, WorkspaceRowDto } from '@shared/validations'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'

@Injectable()
export class WorkspaceService {
    constructor(@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>) {}

    async createWorkspace(userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceRowDto> {
        return this.db.transaction(async tx => {
            const [workspace] = await tx.insert(schema.WorkspaceSchema).values(dto).returning()

            await tx.insert(schema.WorkspaceMemberSchema).values({
                workspaceId: workspace.id,
                userId: userId,
            })

            return workspace
        })
    }

    async getUserWorkspaces(userId: string) {
        return this.db
            .select({
                name: schema.WorkspaceSchema.name,
                slug: schema.WorkspaceSchema.slug,
                id: schema.WorkspaceSchema.id,
            })
            .from(schema.WorkspaceMemberSchema)
            .innerJoin(
                schema.WorkspaceSchema,
                eq(schema.WorkspaceSchema.id, schema.WorkspaceMemberSchema.workspaceId),
            )
            .where(eq(schema.WorkspaceMemberSchema.userId, userId))
    }
}
