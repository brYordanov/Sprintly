import z from 'zod'

export const RegisterBodySchema = z
    .object({
        email: z
            .email('Please enter a valid email address')
            .max(320, 'Email must be less than 320 characters'),
        username: z
            .string()
            .trim()
            .min(3, 'Username must be at least 3 characters')
            .max(32, 'Username must be less than 32 characters')
            .regex(
                /^[a-zA-Z0-9_]+$/,
                'Username can only contain letters, numbers, and underscores',
            ),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must be less than 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            ),
        fullname: z
            .string()
            .trim()
            .min(2, 'Full name must be at least 2 characters')
            .max(100, 'Full name must be less than 100 characters')
            .optional(),
        // avatarUrl: ValidImgUrlSchema.nullable().optional(),
        // todo this will be set on update
    })
    .strict()
export type RegisterBodyDto = z.infer<typeof RegisterBodySchema>

export const LoginBodySchema = z
    .object({
        identifier: z.string().min(3).max(320),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must be less than 100 characters'),
    })
    .strict()
export type LoginBodyDto = z.infer<typeof LoginBodySchema>
