import { Body, Controller, Post } from '@nestjs/common'
import { CompanyRowDto, type CreateCompanyDto, CreateCompanySchema } from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { CompanyService } from './company.service'

@Controller('company')
export class CompanyController {
    constructor(private readonly service: CompanyService) {}

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateCompanySchema)) dto: CreateCompanyDto,
    ): Promise<CompanyRowDto> {
        return this.service.createCompany(dto)
    }
}
