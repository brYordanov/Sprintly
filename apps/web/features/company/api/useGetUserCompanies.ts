import { apiClient } from '@/lib/api/client'
import { UserCompanySummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const USER_COMPANIES = 'userCompanies' as const

export function useGetUserCompanies() {
    return useQuery({
        queryKey: [USER_COMPANIES],
        queryFn: async () => apiClient<UserCompanySummary[]>(`company`),
    })
}
