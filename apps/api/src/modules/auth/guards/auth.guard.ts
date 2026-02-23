import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthUser {
    id: string
}

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly accessSecret: string
    constructor(private readonly config: ConfigService) {
        this.accessSecret = this.config.get<string>('JWT_ACCESS_SECRET') ?? ''
        if (!this.accessSecret) throw new Error('JWT_ACCESS_SECRET is missing')
    }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<Request>()
        const tkn = req.cookies?.accessToken

        if (!tkn) throw new UnauthorizedException('Access token required')

        try {
            const payload = jwt.verify(tkn, this.accessSecret)
            req.user = { id: typeof payload === 'string' ? payload : payload.sub }
        } catch (err) {}
        return true
    }

    private getTokenFromHeader(req: Request): string | undefined {
        const authHeader = req.headers.authorization
        if (!authHeader) return undefined

        const [type, token] = authHeader.split(' ')
        return type === 'Bearer' ? token : undefined
    }
}
