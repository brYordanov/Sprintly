import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import {
    type LoginBodyDto,
    LoginBodySchema,
    type RegisterBodyDto,
    RegisterBodySchema,
    UserPublicDto,
} from '@shared/validations'
import { type Request, type Response } from 'express'
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { User } from './decorators/user.decorator'
import { AuthGuard } from './guards/auth.guard'

const AuthThrottler = () =>
    Throttle({
        short: { limit: 5, ttl: 60000 },
        medium: { limit: 20, ttl: 3600000 },
    })

@Controller('auth')
export class AuthController {
    constructor(
        private readonly service: AuthService,
        private readonly userService: UserService,
    ) {}

    @Get('me')
    @UseGuards(AuthGuard)
    async me(@Req() req: Request, @User() user: { id: string }): Promise<UserPublicDto> {
        return this.userService.findByIdOrFail(user.id)
    }

    @AuthThrottler()
    @Post('register')
    async register(
        @Body(new ZodValidationPipe(RegisterBodySchema)) dto: RegisterBodyDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<UserPublicDto> {
        const out = await this.service.register(dto, this.getMeta(req))
        this.setRefreshCookie(res, out.refreshToken, out.expiresAt)
        this.setAccessCookie(res, out.accessToken)
        return out.user
    }

    @AuthThrottler()
    @Post('login')
    async login(
        @Body(new ZodValidationPipe(LoginBodySchema)) dto: LoginBodyDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<UserPublicDto> {
        const out = await this.service.login(dto, this.getMeta(req))
        this.setRefreshCookie(res, out.refreshToken, out.expiresAt)
        this.setAccessCookie(res, out.accessToken)
        return out.user
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.refreshToken
        if (token) await this.service.logout(token)
        res.clearCookie('refreshToken', this.getCookieBaseOptions())
        res.clearCookie('accessToken', this.getCookieBaseOptions())
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

    private setAccessCookie(res: Response, token: string) {
        res.cookie('accessToken', token, {
            ...this.getCookieBaseOptions(),
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
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
