import { apiClient, ApiError } from '@/lib/api/client'
import { WorkspaceDetails } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const WORKSPACE_DETAILS = 'workspaceDetails' as const

export function useGetWorkspaceDetails(workspaceSlug: string) {
    return useQuery<WorkspaceDetails, ApiError>({
        queryKey: [WORKSPACE_DETAILS, workspaceSlug],
        queryFn: async () => apiClient<WorkspaceDetails>(`workspace/${workspaceSlug}/details`),
    })
}
