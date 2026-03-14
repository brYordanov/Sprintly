import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
    AddProjectMemberSchema,
    ChangePermissionSchema,
    CreateProjectSchema,
    EditProjectSchema,
    ProjectDetails,
    ProjectMember,
    ProjectNavigationSummary,
    ProjectNonMember,
    type AddProjectMemberDto,
    type ChangePermissionDto,
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

    @Get(':projectId/invitable/search')
    async searchNonMembers(
        @Param('projectId') projectId: string,
        @Query('q') query: string,
    ): Promise<ProjectNonMember[]> {
        return this.service.searchNonMembers(projectId, query)
    }

    @Post(':projectId/add-member')
    async addMember(
        @Body(new ZodValidationPipe(AddProjectMemberSchema)) dto: AddProjectMemberDto,
        @Param('projectId') projectId: string,
    ): Promise<ProjectMember[]> {
        return this.service.addMembers(projectId, dto.nonMembers)
    }

    @Patch(':projectId/user/:userId')
    async changeMemberPermission(
        @Body(new ZodValidationPipe(ChangePermissionSchema)) dto: ChangePermissionDto,
        @User() user: AuthUser,
        @Param('projectId') projectId: string,
        @Param('userId') userId: string,
    ): Promise<ProjectMember> {
        return this.service.changeProjectMemberPermission(user.id, projectId, userId, dto.permissionId)
    }

    @Delete(':projectId/user/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeMember(
        @User() user: AuthUser,
        @Param('projectId') projectId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        return this.service.removeProjectMember(user.id, projectId, userId)
    }
}
