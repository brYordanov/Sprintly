import z from 'zod'
import { ValidImgUrlSchema } from './common.schemas'

export const CreateUserBodySchema = z
    .object({
        email: z.email().max(320),
        username: z
            .string()
            .min(3)
            .max(32)
            .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
        password: z.string().min(8).max(72),
        fullname: z.string().nullable().optional(),
        avatarUrl: ValidImgUrlSchema.nullable().optional(),
    })
    .strict()
export type CreateUserBodyDto = z.infer<typeof CreateUserBodySchema>

export const UpdateProfileSchema = z
    .object({
        fullname: z.string().nullable().optional(),
        avatarUrl: ValidImgUrlSchema.nullable().optional(),
    })
    .strict()
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>

export const UserPublicSchema = z.object({
    id: z.uuid(),
    email: z.string(),
    username: z.string(),
    fullname: z.string().nullable(),
    avatarUrl: z.string().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    emailVerifiedAt: z.date().nullable(),
    status: z.enum(['active', 'deleted']),
})
export type UserPublicDto = z.infer<typeof UserPublicSchema>
