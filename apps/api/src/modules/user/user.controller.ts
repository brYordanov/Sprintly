import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { type CreateUserBodyDto, CreateUserBodySchema, UserPublicDto } from '@shared/validations'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(new ZodValidationPipe(CreateUserBodySchema)) dto: CreateUserBodyDto,
    ): Promise<UserPublicDto> {
        return this.service.createUser(dto)
    }
}
