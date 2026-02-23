import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'

@Module({
    controllers: [CompanyController],
    providers: [CompanyService],
    exports: [CompanyService],
    imports: [UserModule],
})
export class CompanyModule {}
