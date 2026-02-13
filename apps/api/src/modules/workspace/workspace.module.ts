import { Module } from '@nestjs/common'
import { CompanyModule } from '../company/company.module'
import { WorkspaceController } from './workspace.controller'
import { WorkspaceService } from './workspace.service'

@Module({
    controllers: [WorkspaceController],
    providers: [WorkspaceService],
    exports: [WorkspaceService],
    imports: [CompanyModule],
})
export class WorkspaceModule {}
