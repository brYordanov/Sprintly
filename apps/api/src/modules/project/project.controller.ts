import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import {
    CreateProjectSchema,
    EditProjectSchema,
    ProjectDetails,
    ProjectNavigationSummary,
    type CreateProjectDto,
    type EditProjectDto,
    type ProjectRowDto,
} from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { User } from '../auth/decorators/user.decorator'
import { AuthGuard, type AuthUser } from '../auth/guards/auth.guard'
import { ProjectService } from './project.service'

@Controller('project')
@UseGuards(AuthGuard)
export class ProjectController {
    constructor(private readonly service: ProjectService) {}

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto,
        @User() user: AuthUser,
    ): Promise<ProjectRowDto> {
        return this.service.createProject(user.id, dto)
    }

    @Get()
    async getProjectsForUser(@User() user: AuthUser): Promise<ProjectNavigationSummary[]> {
        return this.service.getUserProjects(user.id)
    }

    @Patch(':projectId')
    async edit(
        @User() user: AuthUser,
        @Param('projectId') projectId: string,
        @Body(new ZodValidationPipe(EditProjectSchema)) dto: EditProjectDto,
    ): Promise<ProjectRowDto> {
        return this.service.editProject(projectId, user.id, dto)
    }

    @Get(':projectSlug/details')
    async getProjectDetails(
        @User() user: AuthUser,
        @Param('projectSlug') projectSlug: string,
    ): Promise<ProjectDetails> {
        return this.service.getProjectDetails(projectSlug, user.id)
    }
}
