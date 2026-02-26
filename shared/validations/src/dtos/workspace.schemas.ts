import z from 'zod'
import { CompanyRowSchema } from './company.schemas'
import { PossiblePermissionName } from './permission.schemas'
import { ProjectNavigationSummary } from './project.schemas'
import { UserPublicDto } from './user.schemas'

export const WorkspaceRowSchema = z.object({
    id: z.uuid(),
    companyId: z.uuid(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().nullable(),
    createdBy: z.uuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    company: CompanyRowSchema.optional(),
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
export type UserWorkspaceNavigationSummary = UserWorkspaceSummary & {
    companySlug?: string
}
export type WorkspaceSummary = Pick<WorkspaceRowDto, 'name' | 'slug' | 'id'> & {
    projectCount: number
    memberCount: number
}

export type WorkspaceNonMember = Pick<
    UserPublicDto,
    'id' | 'fullname' | 'username' | 'email' | 'avatarUrl'
>
export type WorkspaceMember = WorkspaceNonMember & {
    workspacePermissionName: PossiblePermissionName | null
    workspacePermissionId: number | null
    companyPermissionName: PossiblePermissionName | null
    companyPermissionId: number | null
}

export const EditWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name must be 100 characters or less')
        .optional(),
    slug: z
        .string()
        .min(1, 'Slug cannot be empty')
        .max(100, 'Slug must be 100 characters or less')
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens')
        .optional(),
    description: z.string().nullable().optional(),
})
export type EditWorkspaceDto = z.infer<typeof EditWorkspaceSchema>

export const AddWorkspaceMemberSchema = z.object({
    nonMembers: z.array(z.object({ userId: z.uuid(), permissionId: z.number().int() })).min(1),
})
export type AddWorkspaceMemberDto = z.infer<typeof AddWorkspaceMemberSchema>

export type WorkspaceStats = { memberCount: number; projectCount: number }
export type WorkspaceDetails = {
    workspace: WorkspaceRowDto
    stats: WorkspaceStats
    members: WorkspaceMember[]
    workspaceProjects: ProjectNavigationSummary[]
}
