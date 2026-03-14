import { apiClient } from '@/lib/api/client'
import { ProjectNonMember } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const INVITABLE_PROJECT_USERS = 'invitableProjectUsers' as const

export function useGetInvitableProjectUsers(projectId: string, query: string) {
    return useQuery({
        queryKey: [INVITABLE_PROJECT_USERS, projectId, query],
        queryFn: async () =>
            apiClient<ProjectNonMember[]>(
                `project/${projectId}/invitable/search?q=${encodeURIComponent(query)}`,
            ),
    })
}
