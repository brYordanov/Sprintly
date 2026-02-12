import { apiClient } from '@/lib/api/client'
import { UserWorkspaceSummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const USER_WORKSPACES = 'userWorkspaces' as const

export function useGetViewableUserWorkspaces() {
    return useQuery({
        queryKey: [USER_WORKSPACES],
        queryFn: async () => apiClient<UserWorkspaceSummary[]>(`workspace/viewable`),
    })
}
