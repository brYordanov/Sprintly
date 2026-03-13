import { apiClient } from '@/lib/api/client'
import { AddWorkspaceMemberDto, WorkspaceDetails, WorkspaceMember } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { INVITABLE_WORKSPACE_USERS } from './useGetInvitableWorkspaceUsers'
import { WORKSPACE_DETAILS } from './useGetWorkspaceDetails'

export function useAddWorkspaceMember(workspaceId: string, workspaceSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: AddWorkspaceMemberDto) =>
            apiClient<WorkspaceMember[]>(`workspace/${workspaceId}/add-member`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: addedMembers => {
            toast.success(`${addedMembers.length} member${addedMembers.length > 1 ? 's' : ''} added`)
            queryClient.setQueryData<WorkspaceDetails>(
                [WORKSPACE_DETAILS, workspaceSlug],
                old => old && { ...old, members: [...old.members, ...addedMembers] },
            )
            queryClient.invalidateQueries({ queryKey: [INVITABLE_WORKSPACE_USERS, workspaceId] })
        },
        onError: err => {
            console.error(`Adding workspace member failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
