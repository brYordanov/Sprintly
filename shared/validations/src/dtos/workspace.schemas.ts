import z from 'zod'

export const WorkspaceRowSchema = z.object({
    id: z.uuid(),
    companyId: z.uuid(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().nullable(),
    createdBy: z.uuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})
export type WorkspaceRowDto = z.infer<typeof WorkspaceRowSchema>

export const CreateWorkspaceSchema = z.object({
    companyId: z.uuid(),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be 100 characters or less')
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
})
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>

export type UserWorkspaceSummary = Pick<WorkspaceRowDto, 'name' | 'slug' | 'id'>
