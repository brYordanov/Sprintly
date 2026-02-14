import { Module } from '@nestjs/common'
import { CompanyModule } from '../company/company.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'

@Module({
    controllers: [ProjectController],
    providers: [ProjectService],
    imports: [WorkspaceModule, CompanyModule],
})
export class ProjectModule {}
