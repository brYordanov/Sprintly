import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
    AddWorkspaceMemberSchema,
    CreateWorkspaceSchema,
    UserWorkspaceNavigationSummary,
    UserWorkspaceSummary,
    WorkspaceMember,
    WorkspaceNonMember,
    WorkspaceRowDto,
    type AddWorkspaceMemberDto,
    type CreateWorkspaceDto,
} from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { User } from '../auth/decorators/user.decorator'
import { AuthGuard, type AuthUser } from '../auth/guards/auth.guard'
import { WorkspaceService } from './workspace.service'

@Controller('workspace')
@UseGuards(AuthGuard)
export class WorkspaceController {
    constructor(private readonly service: WorkspaceService) {}

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateWorkspaceSchema)) dto: CreateWorkspaceDto,
        @User() user: AuthUser,
    ): Promise<WorkspaceRowDto> {
        return this.service.createWorkspace(dto, user.id)
    }

    @Get('viewable')
    async getViewableWorkspacesForUser(
        @User() user: AuthUser,
    ): Promise<UserWorkspaceNavigationSummary[]> {
        return this.service.getViewableUserWorkspaces(user.id)
    }

    @Get('manageable')
    async getManageableWorkspacesForUser(@User() user: AuthUser): Promise<UserWorkspaceSummary[]> {
        return this.service.getManageableUserWorkspaces(user.id)
    }

    @Get(':workspaceSlug/details')
    async getWorkspaceDetails(
        @User() user: AuthUser,
        @Param('workspaceSlug') workspaceSlug: string,
    ) {
        return this.service.getWorkspaceDetails(workspaceSlug, user.id)
    }

    @Get(':workspaceId/invitable/search')
    async searchNonMembers(
        @Param('workspaceId') workspaceId: string,
        @Query('q') query: string,
    ): Promise<WorkspaceNonMember[]> {
        return this.service.searchNonMembers(workspaceId, query)
    }

    @Post(':workspaceId/add-member')
    async addMember(
        @Body(new ZodValidationPipe(AddWorkspaceMemberSchema)) dto: AddWorkspaceMemberDto,
        @Param('workspaceId') workspaceId: string,
    ): Promise<WorkspaceMember[]> {
        return this.service.addMembers(workspaceId, dto.nonMembers)
    }
}
