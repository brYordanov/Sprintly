import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
    CompanyRowDto,
    type CreateCompanyDto,
    CreateCompanySchema,
    UserCompanySummary,
} from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { User } from '../auth/decorators/user.decorator'
import { AuthGuard } from '../auth/guards/auth.guard'
import { CompanyService } from './company.service'

@Controller('company')
@UseGuards(AuthGuard)
export class CompanyController {
    constructor(private readonly service: CompanyService) {}

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateCompanySchema)) dto: CreateCompanyDto,
        @User() user: { id: string },
    ): Promise<CompanyRowDto> {
        return this.service.createCompany(user.id, dto)
    }

    @Get('viewable')
    async getViewableCompaniesForUser(@User() user: { id: string }): Promise<UserCompanySummary[]> {
        return this.service.getViewableCompaniesForUser(user.id)
    }

    @Get('manageable')
    async getManageableCompaniesForUser(
        @User() user: { id: string },
    ): Promise<UserCompanySummary[]> {
        return this.service.getManageableCompaniesForUser(user.id)
    }
}
