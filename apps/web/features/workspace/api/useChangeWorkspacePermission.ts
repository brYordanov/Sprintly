import { apiClient } from '@/lib/api/client'
import { ChangePermissionDto, WorkspaceDetails, WorkspaceMember } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WORKSPACE_DETAILS } from './useGetWorkspaceDetails'

export function useChangeWorkspacePermission(
    workspaceId: string,
    userId: string,
    workspaceSlug: string,
) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ChangePermissionDto) =>
            apiClient<WorkspaceMember>(`workspace/${workspaceId}/user/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: updatedMember => {
            toast.success('Permission updated')
            queryClient.setQueryData<WorkspaceDetails>(
                [WORKSPACE_DETAILS, workspaceSlug],
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
