import { apiClient } from '@/lib/api/client'
import { ChangePermissionDto, ProjectDetails, ProjectMember } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PROJECT_DETAILS } from './useGetProjectDetails'

export function useChangeProjectPermission(projectId: string, userId: string, projectSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ChangePermissionDto) =>
            apiClient<ProjectMember>(`project/${projectId}/user/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: updatedMember => {
            toast.success('Permission updated')
            queryClient.setQueryData<ProjectDetails>(
                [PROJECT_DETAILS, projectSlug],
                old =>
                    old && {
                        ...old,
                        members: old.members.map(m =>
                            m.id === updatedMember.id ? updatedMember : m,
                        ),
                    },
            )
        },
    })
}
