import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
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

const AuthThrottler = () =>
    Throttle({
        short: { limit: 5, ttl: 60000 },
        medium: { limit: 20, ttl: 3600000 },
    })

@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {}

    @AuthThrottler()
    @Post('register')
    async register(
        @Body(new ZodValidationPipe(RegisterBodySchema)) dto: RegisterBodyDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const output = await this.service.register(dto, this.getMeta(req))
        this.setRefreshCookie(res, output.refreshToken, output.expiresAt)
        return { user: output.user, accessToken: output.accessToken }
    }

    @AuthThrottler()
    @Post('login')
    async login(
        @Body(new ZodValidationPipe(LoginBodySchema)) dto: LoginBodyDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const out = await this.service.login(dto, this.getMeta(req))
        this.setRefreshCookie(res, out.refreshToken, out.expiresAt)
        return { user: out.user, accessToken: out.accessToken }
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.refreshToken
        if (token) await this.service.logout(token)
        res.clearCookie('refreshToken', this.getCookieBaseOptions())
        return { ok: true }
    }

    @AuthThrottler()
    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.refreshToken
        if (!token) throw new UnauthorizedException('Refresh token required')
        const out = await this.service.refresh(token, this.getMeta(req))
        this.setRefreshCookie(res, out.refreshToken, out.expiresAt)
        return { accessToken: out.accessToken }
    }

    private setRefreshCookie(res: Response, token: string, expiresAt: Date) {
        res.cookie('refreshToken', token, {
            ...this.getCookieBaseOptions(),
            httpOnly: true,
            sameSite: 'lax',
            path: '/auth',
            maxAge: expiresAt.getTime() - Date.now(),
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
