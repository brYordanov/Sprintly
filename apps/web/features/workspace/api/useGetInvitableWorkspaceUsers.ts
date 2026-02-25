import { apiClient } from '@/lib/api/client'
import { WorkspaceNonMember } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const INVITABLE_WORKSPACE_USERS = 'invitableWorkspaceUsers' as const

export function useGetInvitableWorkspaceUsers(workspaceId: string, query: string) {
    return useQuery({
        queryKey: [INVITABLE_WORKSPACE_USERS, workspaceId, query],
        queryFn: async () =>
            apiClient<WorkspaceNonMember[]>(
                `workspace/${workspaceId}/invitable/search?q=${encodeURIComponent(query)}`,
            ),
    })
}
