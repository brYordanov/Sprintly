import { apiClient } from '@/lib/api/client'
import { ProjectDetails } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PROJECT_DETAILS } from './useGetProjectDetails'

export function useRemoveProjectMember(projectId: string, projectSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userId: string) =>
            apiClient<void>(`project/${projectId}/user/${userId}`, { method: 'DELETE' }),
        onSuccess: (_, userId) => {
            toast.success('Member removed')
            queryClient.setQueryData<ProjectDetails>(
                [PROJECT_DETAILS, projectSlug],
                old =>
                    old && {
                        ...old,
                        members: old.members.filter(m => m.id !== userId),
                    },
            )
        },
        onError: () => {
            toast.error('Something went wrong')
        },
    })
}
