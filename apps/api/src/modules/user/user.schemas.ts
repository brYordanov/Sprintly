import { UserPublicSchema } from '@shared/validations'
import z from 'zod'

export const UserSchema = UserPublicSchema.extend({
    passHash: z.string(),
    emailNormalized: z.string(),
})
export type UserRow = z.infer<typeof UserSchema>
