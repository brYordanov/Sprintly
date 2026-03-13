import z from 'zod'
import { ValidImgUrlSchema } from './common.schemas'
import { PossiblePermissionName } from './permission.schemas'
import { UserPublicDto } from './user.schemas'

export const ProjectRowSchema = z.object({
    id: z.uuid(),
    companyId: z.uuid(),
    workspaceId: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(10),
    description: z.string().nullable(),
    iconUrl: ValidImgUrlSchema.nullable(),
    createdBy: z.uuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})
export type ProjectRowDto = z.infer<typeof ProjectRowSchema>

export const CreateProjectSchema = z.object({
    companyId: z.uuid(),
    workspaceId: z.uuid().optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(10, 'Slug must be 10 characters or less')
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    iconUrl: ValidImgUrlSchema.optional(),
})
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>

export const EditProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name must be 100 characters or less')
        .optional(),
    slug: z
        .string()
        .min(1, 'Slug cannot be empty')
        .max(10, 'Slug must be 10 characters or less')
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens')
        .optional(),
    workspaceId: z.uuid().nullable().optional(),
    description: z.string().nullable().optional(),
    iconUrl: ValidImgUrlSchema.nullable().optional(),
})
export type EditProjectDto = z.infer<typeof EditProjectSchema>

export type ProjectSummary = Pick<ProjectRowDto, 'name' | 'slug' | 'id'>
export type ProjectNavigationSummary = ProjectSummary & {
    companySlug: string
    workspaceSlug: string | null
    workspaceName: string | null
}

export type ProjectNonMember = Pick<
    UserPublicDto,
    'id' | 'fullname' | 'username' | 'email' | 'avatarUrl'
>
export type ProjectMember = ProjectNonMember & {
    projectPermissionName: PossiblePermissionName | null
    projectPermissionId: number | null
    workspacePermissionName: PossiblePermissionName | null
    workspacePermissionId: number | null
    companyPermissionName: PossiblePermissionName | null
    companyPermissionId: number | null
}

export type ProjectDetails = {
    project: ProjectRowDto
    members: ProjectMember[]
}
