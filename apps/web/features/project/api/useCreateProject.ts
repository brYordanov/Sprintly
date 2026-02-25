import { COMPANY_DETAILS } from '@/features/company/api/useGetCompanyDetails'
import { WORKSPACE_DETAILS } from '@/features/workspace/api/useGetWorkspaceDetails'
import { apiClient } from '@/lib/api/client'
import {
    CompanyDetails,
    CreateProjectDto,
    ProjectRowDto,
    WorkspaceDetails,
} from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { USER_PROJECTS } from './useGetUserProjects'

export function useCreateProject(
    companySlug?: string,
    workspaceSlug?: string,
    workspaceName?: string,
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateProjectDto) =>
            apiClient<ProjectRowDto>('project', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: newProject => {
            toast.success('Company created')
            queryClient.invalidateQueries({ queryKey: [USER_PROJECTS] })

            if (!companySlug) return
            queryClient.setQueryData<CompanyDetails>(
                [COMPANY_DETAILS, companySlug],
                old =>
                    old && {
                        ...old,
                        companyProjects: [
                            ...old.companyProjects,
                            {
                                id: newProject.id,
                                name: newProject.name,
                                slug: newProject.slug,
                                companySlug: companySlug ?? null,
                                workspaceSlug: workspaceSlug ?? null,
                                workspaceName: workspaceName ?? null,
                            },
                        ],
                        workspaces: old.workspaces.map(w =>
                            w.name === workspaceName ? { ...w, projectCount: ++w.projectCount } : w,
                        ),
                        stats: {
                            ...old.stats,
                            projectCount: ++old.stats.projectCount,
                        },
                    },
            )

            if (!workspaceName || !workspaceSlug) return
            queryClient.setQueryData<WorkspaceDetails>(
                [WORKSPACE_DETAILS, workspaceSlug],
                old =>
                    old && {
                        ...old,
                        workspaceProjects: [
                            ...old.workspaceProjects,
                            {
                                id: newProject.id,
                                name: newProject.name,
                                slug: newProject.slug,
                                companySlug,
                                workspaceSlug,
                                workspaceName,
                            },
                        ],
                    },
            )
        },
        onError: err => {
            console.error(`Company creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
