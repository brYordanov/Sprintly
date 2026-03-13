import { apiClient } from '@/lib/api/client'
import { WorkspaceDetails } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WORKSPACE_DETAILS } from './useGetWorkspaceDetails'

export function useRemoveWorkspaceMember(workspaceId: string, workspaceSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userId: string) =>
            apiClient<void>(`workspace/${workspaceId}/user/${userId}`, { method: 'DELETE' }),
        onSuccess: (_, userId) => {
            toast.success('Member removed')
            queryClient.setQueryData<WorkspaceDetails>(
                [WORKSPACE_DETAILS, workspaceSlug],
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
