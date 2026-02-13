import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
    CreateProjectSchema,
    type CreateProjectDto,
    type ProjectRowDto,
    type ProjectSummary,
} from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { User } from '../auth/decorators/user.decorator'
import { AuthGuard } from '../auth/guards/auth.guard'
import { ProjectService } from './project.service'

@Controller('project')
@UseGuards(AuthGuard)
export class ProjectController {
    constructor(private readonly service: ProjectService) {}

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto,
        @User() user: { id: string },
    ): Promise<ProjectRowDto> {
        return this.service.createProject(user.id, dto)
    }

    @Get()
    async getProjectsForUser(@User() user: { id: string }): Promise<ProjectSummary[]> {
        return this.service.getUserProjects(user.id)
    }
}
