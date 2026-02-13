import { apiClient } from '@/lib/api/client'
import { ProjectSummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const USER_COMPANIES = 'userProjects' as const

export function useGetUserProjects() {
    return useQuery({
        queryKey: [USER_COMPANIES],
        queryFn: async () => apiClient<ProjectSummary[]>(`project`),
    })
}
