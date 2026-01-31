import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq, gt, isNotNull, isNull, lt, or } from 'drizzle-orm'
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
    private readonly jwtHmacSecret: string
    constructor(
        @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
        private readonly config: ConfigService,
        private readonly userService: UserService,
    ) {
        this.accessSecret = this.mustHave('JWT_ACCESS_SECRET')
        this.jwtHmacSecret = this.mustHave('JWT_REFRESH_HMAC_SECRET')
        this.accessTtlSec = Number(this.config.get('JWT_ACCESS_TTL_SECONDS') ?? 900)
        this.refreshTtlDays = Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30)
    }

    async register(dto: RegisterBodyDto, meta: SessionMetaDto) {
        const userPublic = await this.userService.createUser(dto)

        const session = await this.createSession(userPublic.id, meta)

        return {
            user: userPublic,
            accessToken: this.signAccessToken(userPublic.id, session.id),
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
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
            accessToken: this.signAccessToken(user.id, session.id),
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
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

        return await this.db.transaction(async tx => {
            const [session] = await tx
                .select()
                .from(schema.UserSessionSchema)
                .where(
                    and(
                        eq(schema.UserSessionSchema.refreshTokenHash, tokenHash),
                        isNull(schema.UserSessionSchema.revokedAt),
                        gt(schema.UserSessionSchema.expiresAt, now),
                    ),
                )
                .limit(1)

            if (!session) throw new UnauthorizedException('Invalid refresh token')

            await tx
                .update(schema.UserSessionSchema)
                .set({ revokedAt: now, lastUsedAt: now })
                .where(eq(schema.UserSessionSchema.id, session.id))

            const newSession = await this.createSession(session.userId, meta, tx)

            return {
                accessToken: this.signAccessToken(session.userId, session.id),
                refreshToken: newSession.refreshToken,
                expiresAt: session.expiresAt,
            }
        })
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
                    : eq(schema.UserSchema.username, identifier.trim()),
            )
            .limit(1)

        if (!user) throw new UnauthorizedException('Invalid credentials')
        return user
    }

    async cleanupExpiredSessions() {
        await this.db
            .delete(schema.UserSessionSchema)
            .where(
                or(
                    lt(schema.UserSessionSchema.expiresAt, new Date()),
                    isNotNull(schema.UserSessionSchema.revokedAt),
                ),
            )
    }

    private async createSession(
        userId: string,
        meta: SessionMetaDto,
        tx?: NodePgDatabase<typeof schema>,
    ) {
        const db = tx ?? this.db
        const refreshToken = this.generateRefreshToken()
        const refreshTokenHash = this.hashRefreshToken(refreshToken)

        const expiresAt = new Date(Date.now() + this.refreshTtlDays * 24 * 60 * 60 * 1000)

        const [session] = await db
            .insert(schema.UserSessionSchema)
            .values({
                userId,
                refreshTokenHash,
                userAgent: meta.userAgent,
                ip: meta.ip,
                expiresAt,
            })
            .returning()

        return { refreshToken, expiresAt, id: session.id }
    }

    private generateRefreshToken() {
        return crypto.randomBytes(48).toString('base64url')
    }

    private hashRefreshToken(token: string): string {
        return crypto.createHmac('sha256', this.jwtHmacSecret).update(token).digest('hex')
    }

    private signAccessToken(userId: string, sessionId: string) {
        return jwt.sign({ sub: userId, sid: sessionId }, this.accessSecret, {
            expiresIn: this.accessTtlSec,
        })
    }

    private mustHave(key: string): string {
        const v = this.config.get<string>(key)
        if (!v) throw new Error(`${key} is missing`)
        return v
    }
}
