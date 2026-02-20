import { apiClient } from '@/lib/api/client'
import { CompanyNonMember } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const INVITABLE_USERS = 'invitableUsers' as const

export function useGetInvitableUsers(companyId: string, query: string) {
    return useQuery({
        queryKey: [INVITABLE_USERS, companyId, query],
        queryFn: async () =>
            apiClient<CompanyNonMember[]>(
                `company/${companyId}/invitable/search?q=${encodeURIComponent(query)}`,
            ),
    })
}
