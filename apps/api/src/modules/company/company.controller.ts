import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import {
    type AddMemberDto,
    AddMemberSchema,
    type ChangePermissionDto,
    ChangePermissionSchema,
    CompanyDetails,
    CompanyMember,
    CompanyNonMember,
    CompanyRowDto,
    type CreateCompanyDto,
    CreateCompanySchema,
    type EditCompanyDto,
    EditCompanySchema,
    UserCompanySummary,
} from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { User } from '../auth/decorators/user.decorator'
import { AuthGuard, type AuthUser } from '../auth/guards/auth.guard'
import { CompanyService } from './company.service'

@Controller('company')
@UseGuards(AuthGuard)
export class CompanyController {
    constructor(private readonly service: CompanyService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(new ZodValidationPipe(CreateCompanySchema)) dto: CreateCompanyDto,
        @User() user: AuthUser,
    ): Promise<CompanyRowDto> {
        return this.service.createCompany(user.id, dto)
    }

    @Get('viewable')
    async getViewableCompaniesForUser(@User() user: AuthUser): Promise<UserCompanySummary[]> {
        return this.service.getViewableCompaniesForUser(user.id)
    }

    @Get('manageable')
    async getManageableCompaniesForUser(@User() user: AuthUser): Promise<UserCompanySummary[]> {
        return this.service.getManageableCompaniesForUser(user.id)
    }

    @Get(':companySlug/details')
    async getCompanyDetails(
        @Param('companySlug') companySlug: string,
        @User() user: AuthUser,
    ): Promise<CompanyDetails> {
        return this.service.getCompanyDetails(companySlug, user.id)
    }

    @Get(':companyId/invitable/search')
    async searchNonMembers(
        @Param('companyId') companyId: string,
        @Query('q') query: string,
    ): Promise<CompanyNonMember[]> {
        return this.service.searchNonMembers(companyId, query)
    }

    @Patch(':companyId')
    async editCompany(
        @Body(new ZodValidationPipe(EditCompanySchema)) dto: EditCompanyDto,
        @User() user: AuthUser,
        @Param('companyId') companyId: string,
    ): Promise<CompanyRowDto> {
        return this.service.editCompany(user.id, companyId, dto)
    }

    @Post(':companyId/add-member')
    async addMember(
        @Body(new ZodValidationPipe(AddMemberSchema)) dto: AddMemberDto,
        @Param('companyId') companyId: string,
    ): Promise<CompanyMember[]> {
        return this.service.addMembers(companyId, dto.ids)
    }

    @Delete(':companyId/user/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeMember(
        @User() user: AuthUser,
        @Param('companyId') companyId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        return this.service.removeMember(user.id, companyId, userId)
    }

    @Patch(':companyId/user/:userId')
    async changePermission(
        @Body(new ZodValidationPipe(ChangePermissionSchema)) dto: ChangePermissionDto,
        @User() user: AuthUser,
        @Param('companyId') companyId: string,
        @Param('userId') userId: string,
    ): Promise<CompanyMember> {
        return this.service.changePermission(user.id, companyId, userId, dto.permissionId)
    }
}
