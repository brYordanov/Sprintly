import { apiClient } from '@/lib/api/client'
import { UserCompanySummary } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const VIEWABLE_USER_COMPANIES = 'viewableUserCompanies' as const

export function useGetViewableUserCompanies() {
    return useQuery({
        queryKey: [VIEWABLE_USER_COMPANIES],
        queryFn: async () => apiClient<UserCompanySummary[]>(`company/viewable`),
    })
}
