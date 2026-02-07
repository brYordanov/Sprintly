import z from 'zod'

export const SessionMetaSchema = z.object({
    userAgent: z.string().optional().nullable(),
    ip: z.string().nullable().optional(),
})
export type SessionMetaDto = z.infer<typeof SessionMetaSchema>
