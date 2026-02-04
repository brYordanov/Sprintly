import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { UserSchema, userStatusEnum } from './user.entity'

export const UserSelectSchema = createSelectSchema(UserSchema)
export type UserRow = z.infer<typeof UserSelectSchema>
export const UserPublicSchema = UserSelectSchema.omit({
    passHash: true,
    emailNormalized: true,
}).extend({
    status: z.enum(userStatusEnum.enumValues),
})
export type UserPublicDto = z.infer<typeof UserPublicSchema>
