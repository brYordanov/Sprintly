import { apiClient } from '@/lib/api/client'
import { EditProjectDto, ProjectDetails, ProjectRowDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PROJECT_DETAILS } from './useGetProjectDetails'
import { USER_PROJECTS } from './useGetUserProjects'

export function useEditProject(projectId: string, projectSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: EditProjectDto) =>
            apiClient<ProjectRowDto>(`project/${projectId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: updatedProject => {
            toast.success('Project updated')
            queryClient.invalidateQueries({ queryKey: [USER_PROJECTS] })
            queryClient.setQueriesData<ProjectDetails>(
                { queryKey: [PROJECT_DETAILS, projectSlug] },
                old => old && { ...old, project: updatedProject },
            )
        },
        onError: err => {
            console.error(`Project update failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
