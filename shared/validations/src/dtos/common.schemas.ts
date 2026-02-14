import z from 'zod'

export const ValidImgUrlSchema = z.union([
    z.literal(''),
    z
        .url()
        .max(2048)
        .refine(
            s => {
                const u = new URL(s)
                if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
                if (/[<>"'`]/.test(s)) return false
                return true
            },
            {
                message: 'Invalid or unsafe url',
            },
        ),
])
