import { apiClient } from '@/lib/api/client'
import { ProjectSummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const USER_PROJECTS = 'userProjects' as const

export function useGetUserProjects() {
    return useQuery({
        queryKey: [USER_PROJECTS],
        queryFn: async () => apiClient<ProjectSummary[]>(`project`),
    })
}
