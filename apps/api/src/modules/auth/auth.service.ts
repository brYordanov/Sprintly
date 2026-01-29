import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'
import { UserRow } from '../user/user.dtos'
import { UserService } from '../user/user.service'
import { LoginBodyDto, RegisterBodyDto, SessionMetaDto } from './auth.dtos'

@Injectable()
export class AuthService {
    private readonly accessSecret: string
    private readonly accessTtlSec: number
    private readonly refreshTtlDays: number
    constructor(
        @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
        private readonly config: ConfigService,
        private readonly userService: UserService,
    ) {
        this.accessSecret = this.mustHave('JWT_ACCESS_SECRET')
        this.accessTtlSec = Number(this.config.get('JWT_ACCESS_TTL_SECONDS') ?? 900)
        this.refreshTtlDays = Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30)
    }

    async register(dto: RegisterBodyDto, meta: SessionMetaDto) {
        const userPublic = await this.userService.createUser(dto)

        const session = await this.createSession(userPublic.id, meta)

        return {
            user: userPublic,
            accessToken: this.signAccessToken(userPublic.id),
            refreshToken: session.refreshTokenHash,
        }
    }

    async login(dto: LoginBodyDto, meta: SessionMetaDto) {
        const user = await this.findUserForLogin(dto.identifier)

        const ok = await this.userService.verifyPassword(dto.password, user.passHash)
        if (!ok) throw new UnauthorizedException('Invalid credentials')
        if (user.status === 'deleted') throw new UnauthorizedException('Invalid credentials')

        const session = await this.createSession(user.id, meta)

        return {
            user: this.userService.toPublicDto(user),
            accessToken: this.signAccessToken(user.id),
            refreshToken: session.refreshTokenHash,
        }
    }

    async logout(refreshToken: string) {
        const tokenHash = this.hashRefreshToken(refreshToken)

        await this.db
            .update(schema.UserSessionSchema)
            .set({ revokedAt: new Date() })
            .where(eq(schema.UserSessionSchema.refreshTokenHash, tokenHash))
    }

    async refresh(refreshToken: string, meta: SessionMetaDto) {
        const tokenHash = this.hashRefreshToken(refreshToken)
        const now = new Date()

        const [session] = await this.db
            .select()
            .from(schema.UserSessionSchema)
            .where(
                and(
                    eq(schema.UserSessionSchema.refreshTokenHash, tokenHash),
                    isNull(schema.UserSessionSchema.revokedAt),
                    gt(schema.UserSessionSchema.expiresAt, now),
                ),
            )

        if (!session) throw new UnauthorizedException('Invalid refresh token')

        await this.db
            .update(schema.UserSessionSchema)
            .set({ revokedAt: now, lastUsedAt: now })
            .where(eq(schema.UserSessionSchema.id, session.id))

        const newSession = await this.createSession(session.userId, meta)

        return {
            accessToken: this.signAccessToken(session.userId),
            refreshToken: newSession.refreshTokenHash,
        }
    }

    async findUserForLogin(identifier: string): Promise<UserRow> {
        const isEmail = identifier.includes('@')
        const emailNormalized = isEmail ? identifier.trim().toLowerCase() : null

        const [user] = await this.db
            .select()
            .from(schema.UserSchema)
            .where(
                isEmail && emailNormalized
                    ? eq(schema.UserSchema.emailNormalized, emailNormalized)
                    : eq(schema.UserSchema.username, identifier),
            )

        if (!user) throw new UnauthorizedException('Invalid credentials')
        return user
    }

    private async createSession(userId: string, meta: SessionMetaDto) {
        const token = this.generateAccessToken()
        const refreshTokenHash = this.hashRefreshToken(token)

        const expiresAt = new Date(Date.now() + this.refreshTtlDays * 24 * 60 * 60 * 1000)

        await this.db.insert(schema.UserSessionSchema).values({
            userId,
            refreshTokenHash,
            userAgent: meta.userAgent,
            ip: meta.ip,
            expiresAt,
        })

        return { refreshTokenHash, expiresAt }
    }

    private generateAccessToken() {
        return crypto.randomBytes(48).toString('base64url')
    }

    private hashRefreshToken(token: string): string {
        const secret = this.mustHave('JWT_REFRESH_HMAC_SECRET')
        return crypto.createHmac('sha256', secret).update(token).digest('hex')
    }

    private signAccessToken(payload: string) {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessTtlSec })
    }

    private mustHave(key: string): string {
        const v = this.config.get<string>(key)
        if (!v) throw new Error(`${key} is missing`)
        return v
    }
}
