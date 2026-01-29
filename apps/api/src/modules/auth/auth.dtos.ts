import { ValidImgUrlSchema } from 'src/common/common-schemas'
import z from 'zod'

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

export const SessionMetaSchema = z.object({
    userAgent: z.string().optional().nullable(),
    ip: z.string().nullable().optional(),
})
export type SessionMetaDto = z.infer<typeof SessionMetaSchema>
