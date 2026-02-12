import { apiClient } from '@/lib/api/client'
import { UserCompanySummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const MANAGEABLE_USER_COMPANIES = 'manageableUserCompanies' as const

export function useGetManageableUserCompanies() {
    return useQuery({
        queryKey: [MANAGEABLE_USER_COMPANIES],
        queryFn: async () => apiClient<UserCompanySummary[]>(`company/manageable`),
    })
}
