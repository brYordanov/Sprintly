import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { CreateProjectDto, PERMISSION, ProjectRowDto } from '@shared/validations'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
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

            if (!workspaceLevelPermission || workspaceLevelPermission < PERMISSION.ADMIN.level)
                throw new ForbiddenException('Not high enough permission to use workspace')
        }
        const companyLevelPermission = await this.companyService.getUserCompanyLevelPermissionLevel(
            userId,
            companyId,
        )
        if (!companyLevelPermission || companyLevelPermission < PERMISSION.ADMIN.level)
            throw new ForbiddenException('Not high enough permission to use workspace')
    }
}
