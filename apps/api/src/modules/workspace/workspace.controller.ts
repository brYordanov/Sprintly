import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
    CreateWorkspaceSchema,
    UserWorkspaceNavigationSummary,
    UserWorkspaceSummary,
    WorkspaceRowDto,
    type CreateWorkspaceDto,
} from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { User } from '../auth/decorators/user.decorator'
import { AuthGuard } from '../auth/guards/auth.guard'
import { WorkspaceService } from './workspace.service'

@Controller('workspace')
@UseGuards(AuthGuard)
export class WorkspaceController {
    constructor(private readonly service: WorkspaceService) {}

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateWorkspaceSchema)) dto: CreateWorkspaceDto,
        @User() user: { id: string },
    ): Promise<WorkspaceRowDto> {
        return this.service.createWorkspace(dto, user.id)
    }

    @Get('viewable')
    async getViewableWorkspacesForUser(
        @User() user: { id: string },
    ): Promise<UserWorkspaceNavigationSummary[]> {
        return this.service.getViewableUserWorkspaces(user.id)
    }

    @Get('manageable')
    async getManageableWorkspacesForUser(
        @User() user: { id: string },
    ): Promise<UserWorkspaceSummary[]> {
        return this.service.getManageableUserWorkspaces(user.id)
    }
}
