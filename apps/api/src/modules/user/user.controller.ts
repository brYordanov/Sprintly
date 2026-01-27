import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { CreateUserBodySchema, UserPublicDto, type CreateUserBodyDto } from './user.dtos'
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
