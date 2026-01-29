import { Body, Controller, Post, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Throttle } from '@nestjs/throttler'
import { type Request, type Response } from 'express'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import {
    type LoginBodyDto,
    LoginBodySchema,
    type RegisterBodyDto,
    RegisterBodySchema,
} from './auth.dtos'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
    refreshMaxAgeMs: number
    constructor(
        private readonly service: AuthService,
        private readonly config: ConfigService,
    ) {
        const days = Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30)
        this.refreshMaxAgeMs = days * 24 * 60 * 60 * 1000
    }

    @Throttle({
        short: { limit: 5, ttl: 60000 },
        medium: { limit: 20, ttl: 3600000 },
    })
    @Post('register')
    async register(
        @Body(new ZodValidationPipe(RegisterBodySchema)) dto: RegisterBodyDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const output = await this.service.register(dto, this.getMeta(req))
        this.setRefreshCookie(res, output.refreshToken)
        return { user: output.user, accessToken: output.accessToken }
    }

    @Throttle({
        short: { limit: 5, ttl: 60000 },
        medium: { limit: 20, ttl: 3600000 },
    })
    @Post('login')
    async login(
        @Body(new ZodValidationPipe(LoginBodySchema)) dto: LoginBodyDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const out = await this.service.login(dto, this.getMeta(req))
        this.setRefreshCookie(res, out.refreshToken)
        return { user: out.user, accessToken: out.accessToken }
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.refreshToken
        if (token) await this.service.logout(token)
        res.clearCookie('refreshToken', this.getCookieBaseOptions())
        return { ok: true }
    }

    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.refreshToken
        const out = await this.service.refresh(token, this.getMeta(req))
        this.setRefreshCookie(res, out.refreshToken)
        return { accessToken: out.accessToken }
    }

    private setRefreshCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            ...this.getCookieBaseOptions(),
            httpOnly: true,
            sameSite: 'lax',
            path: '/auth',
            maxAge: this.refreshMaxAgeMs,
        })
    }

    private getMeta(req: Request) {
        return {
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        }
    }

    private getCookieBaseOptions() {
        const isProd = process.env.NODE_ENV === 'prod'
        return {
            secure: isProd,
        }
    }
}
