import z from 'zod'
import { ValidImgUrlSchema } from './common'

export const RegisterBodySchema = z
    .object({
        email: z.email().max(320),
        username: z
            .string()
            .min(3)
            .max(32)
            .regex(/^[a-zA-Z0-9_]+$/),
        password: z.string().min(8).max(72),
        fullname: z.string().nullable().optional(),
        avatarUrl: ValidImgUrlSchema.nullable().optional(),
    })
    .strict()
export type RegisterBodyDto = z.infer<typeof RegisterBodySchema>

export const LoginBodySchema = z
    .object({
        identifier: z.string().min(3).max(320),
        password: z.string().min(1).max(72),
    })
    .strict()
export type LoginBodyDto = z.infer<typeof LoginBodySchema>
