import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import crypto from 'node:crypto'
import { DRIZZLE_DB } from 'src/db/db.module'
import * as schema from 'src/db/drizzle-entrypoint'
import { UserService } from '../user/user.service'
import { RegisterBodyDto, SessionMetaDto } from './auth.dtos'
import jwt from 'jsonwebtoken'

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
        this.accessSecret = this.mustHave('JWT_ACCESS_SECERET')
        this.accessTtlSec = Number(this.config.get('JWT_ACCESS_TTL_SECONDS') ?? 900)
        this.refreshTtlDays = Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30)
    }

    async register(dto: RegisterBodyDto, meta: SessionMetaDto) {
        const userPublic = await this.userService.createUser(dto)

        const session = await this.createSession(userPublic.id, meta)

        return {
            user: userPublic,
            accessToken: 
        }
    }

    private async createSession(userId: string, meta: SessionMetaDto) {
        const token = this.generateAccessToken()
        const tokenHash = this.hashToken(token)

        const expiresAt = new Date(Date.now() + this.refreshTtlDays * 24 * 60 * 60 * 1000)

        await this.db.insert(schema.UserSessionSchema).values({
            userId,
            tokenHash,
            userAgent: meta.userAgent,
            ip: meta.ip,
            expiresAt,
        })

        return { tokenHash, expiresAt }
    }

    private generateAccessToken() {
        return crypto.randomBytes(48).toString('base64url')
    }

    private hashToken(token: string): string {
        const secret = this.mustHave('JWT_REFRESH_HMAC_SECRET')
        return crypto.createHmac('sha256', secret).update(token).digest('hex')
    }

    private signAccessToken(payload:string) {
        return jwt.sign(payload, this.accessSecret, {expiresIn: this.accessTtlSec})
    }

    private mustHave(key: string): string {
        const v = this.config.get<string>(key)
        if (!v) throw new Error(`${key} is missing`)
        return v
    }
}
