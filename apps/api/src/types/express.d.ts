declare namespace Express {
    export interface Request {
        user?: {
            id: string | jwt.JwtPayload
        }
    }
}
