import z from 'zod'
import { ValidImgUrlSchema } from './common.schemas'
import { ProjectNavigationSummary } from './project.schemas'
import { UserPublicDto } from './user.schemas'
import { WorkspaceSummary } from './workspace.schemas'

export const CompanyRowSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().nullable(),
    logoUrl: ValidImgUrlSchema.nullable(),
    createdBy: z.uuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})
export type CompanyRowDto = z.infer<typeof CompanyRowSchema>

export const CreateCompanySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be 100 characters or less')
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    logoUrl: ValidImgUrlSchema.optional(),
})
export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>

export const EditCompanySchema = z.object({
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
    logoUrl: ValidImgUrlSchema.nullable().optional(),
})
export type EditCompanyDto = z.infer<typeof EditCompanySchema>

export const AddMemberSchema = z.object({
    ids: z.array(z.uuid()).min(1),
})
export type AddMemberDto = z.infer<typeof AddMemberSchema>

export type UserCompanySummary = Pick<CompanyRowDto, 'name' | 'slug' | 'id'>

export type CompanyNonMember = Pick<
    UserPublicDto,
    'id' | 'fullname' | 'username' | 'email' | 'avatarUrl'
>
export type CompanyMember = CompanyNonMember & {
    permissionName: string | null
    permissionId: number | null
}

export type CompanyDetails = {
    company: CompanyRowDto
    workspaces: WorkspaceSummary[]
    members: CompanyMember[]
    companyProjects: ProjectNavigationSummary[]
    currentUserEffectivePermissionLevel: number
}
