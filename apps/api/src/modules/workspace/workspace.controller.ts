import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
    CreateWorkspaceSchema,
    type CreateWorkspaceDto,
    WorkspaceRowDto,
    UserWorkspaceSummary,
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
    ): Promise<WorkspaceRowDto> {
        return this.service.createWorkspace(dto)
    }

    @Get()
    async getWorkspacesForUser(@User() user: { id: string }): Promise<UserWorkspaceSummary[]> {
        return this.service.getUserWorkspaces(user.id)
    }
}
