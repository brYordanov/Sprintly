import { createSelectSchema } from 'drizzle-zod'
import { ValidImgUrlSchema } from 'src/common/common-schemas'
import z from 'zod'
import { UserSchema, userStatusEnum } from './user.schema-entity'

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

export const UserSelectSchema = createSelectSchema(UserSchema)
export const UserPublicSchema = UserSelectSchema.omit({
    passHash: true,
    emailNormalized: true,
}).extend({
    status: z.enum(userStatusEnum.enumValues),
})
export type UserPublicDto = z.infer<typeof UserPublicSchema>
