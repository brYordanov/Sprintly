import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import {
    CreateWorkspaceSchema,
    UserWorkspaceNavigationSummary,
    UserWorkspaceSummary,
    WorkspaceRowDto,
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

    @Get(':worksapceId/details')
    async getWorkspaceDetails(@User() user: AuthUser, @Param('workspaceId') workspaceId: string) {
        return this.service.getWorkspaceDetails(workspaceId, user.id)
    }
}
