import { apiClient } from '@/lib/api/client'
import { UserWorkspaceSummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const VIEWABLE_USER_WORKSPACES = 'viewableUserWorkspaces' as const

export function useGetViewableUserWorkspaces() {
    return useQuery({
        queryKey: [VIEWABLE_USER_WORKSPACES],
        queryFn: async () => apiClient<UserWorkspaceSummary[]>(`workspace/viewable`),
    })
}
