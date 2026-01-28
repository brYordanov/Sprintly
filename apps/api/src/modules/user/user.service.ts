import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from '../../db/drizzle-entrypoint'
import { CreateUserBodyDto, UpdateProfileDto, UserPublicDto } from './user.dtos'

function isPgUniqueViolation(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as any).code === '23505'
}

@Injectable()
export class UserService {
    private readonly pepper: string
    constructor(
        @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
        private readonly configService: ConfigService,
    ) {
        this.pepper = this.configService.get<string>('PASSWORD_PEPPER') ?? ''
    }

    async createUser(dto: CreateUserBodyDto): Promise<UserPublicDto> {
        const emailNormalized = dto.email.toLowerCase().trim()
        const passHash = await this.hashPassword(dto.password)

        try {
            const [user] = await this.db
                .insert(schema.UserSchema)
                .values({
                    email: dto.email,
                    emailNormalized,
                    passHash,
                    username: dto.username,
                    fullname: dto.fullname,
                    avatarUrl: dto.avatarUrl,
                })
                .returning()

            return this.toPublicDto(user)
        } catch (err) {
            if (isPgUniqueViolation(err)) {
                throw new ConflictException('Email or username already exists')
            }

            throw err
        }
    }

    async findByIdOrFail(id: string): Promise<UserPublicDto> {
        const [user] = await this.db
            .select()
            .from(schema.UserSchema)
            .where(eq(schema.UserSchema.id, id))
            .limit(1)

        if (!user) throw new NotFoundException('User not found')

        return this.toPublicDto(user)
    }

    async findByEmailOrFail(email: string): Promise<UserPublicDto> {
        const emailNormalized = email.toLowerCase().trim()
        const [user] = await this.db
            .select()
            .from(schema.UserSchema)
            .where(eq(schema.UserSchema.emailNormalized, emailNormalized))
            .limit(1)

        if (!user) throw new NotFoundException('UserNotFound')

        return this.toPublicDto(user)
    }

    async updateProfile(id: string, data: UpdateProfileDto): Promise<UserPublicDto> {
        const [updated] = await this.db
            .update(schema.UserSchema)
            .set({
                ...data,
            })
            .where(eq(schema.UserSchema.id, id))
            .returning()

        if (!updated) throw new NotFoundException('User not found')

        return this.toPublicDto(updated)
    }

    async softDelete(id: string): Promise<void> {
        const [deleted] = await this.db
            .update(schema.UserSchema)
            .set({
                status: 'deleted',
            })
            .where(eq(schema.UserSchema.id, id))
            .returning()

        if (!deleted) {
            throw new NotFoundException('User not found')
        }
    }

    async verifyPassword(plainPass: string, hashedPass: string): Promise<boolean> {
        const input = this.generatePassString(plainPass)
        return argon2.verify(hashedPass, input)
    }

    private async hashPassword(pass: string): Promise<string> {
        const input = this.generatePassString(pass)

        return argon2.hash(input, {
            type: argon2.argon2id,
            memoryCost: 32768,
            timeCost: 2,
            parallelism: 1,
        })
    }

    private generatePassString(pass: string): string {
        return `${pass}\u0000${this.pepper}`
    }

    private toPublicDto(user: any): UserPublicDto {
        const { passHash, emailNormalized, ...publicUser } = user
        return publicUser
    }
}
