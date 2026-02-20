import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import {
    CompanyDetails,
    CompanyRowDto,
    type CreateCompanyDto,
    CreateCompanySchema,
    type EditCompanyDto,
    EditCompanySchema,
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

    @Get(':companySlug/details')
    async getCompanyDetails(
        @Param('companySlug') companySlug: string,
        @User() user: { id: string },
    ): Promise<CompanyDetails> {
        return this.service.getCompanyDetails(companySlug, user.id)
    }

    @Patch(':companyId')
    async editCompany(
        @Body(new ZodValidationPipe(EditCompanySchema)) dto: EditCompanyDto,
        @User() user: { id: string },
        @Param('companyId') companyId: string,
    ): Promise<CompanyRowDto> {
        return this.service.editCompany(user.id, companyId, dto)
    }
}
