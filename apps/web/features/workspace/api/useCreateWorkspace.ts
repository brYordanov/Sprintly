import { COMPANY_DETAILS } from '@/features/company/api/useGetCompanyDetails'
import { apiClient } from '@/lib/api/client'
import { CompanyDetails, CreateWorkspaceDto, WorkspaceRowDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { VIEWABLE_USER_WORKSPACES } from './useGetViewableUserWorkspaces'

export function useCreateWorkspace(companySlug?: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateWorkspaceDto) =>
            apiClient<WorkspaceRowDto>('workspace', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: newWorkspace => {
            toast.success('Workspace created')
            queryClient.invalidateQueries({ queryKey: [VIEWABLE_USER_WORKSPACES] })

            if (!companySlug) return
            queryClient.setQueryData<CompanyDetails>(
                [COMPANY_DETAILS, companySlug],
                old =>
                    old && {
                        ...old,
                        workspaces: [
                            ...old.workspaces,
                            {
                                id: newWorkspace.id,
                                name: newWorkspace.name,
                                slug: newWorkspace.slug,
                                projectCount: 0,
                                memberCount: 1,
                            },
                        ],
                    },
            )
        },
        onError: err => {
            console.error(`Workspace creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
