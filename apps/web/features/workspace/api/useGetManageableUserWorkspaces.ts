import { apiClient } from '@/lib/api/client'
import { UserWorkspaceSummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const MANAGEABLE_USER_WORKSPACES = 'manageableUserWorkspaces' as const

export function useGetManageableUserWorkspaces() {
    return useQuery({
        queryKey: [MANAGEABLE_USER_WORKSPACES],
        queryFn: async () => apiClient<UserWorkspaceSummary[]>(`workspace/manageable`),
    })
}
