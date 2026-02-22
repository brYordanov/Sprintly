import { apiClient } from '@/lib/api/client'
import { CompanyDetails } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { COMPANY_DETAILS } from './useGetCompanyDetails'
import { INVITABLE_USERS } from './useGetInvitableUsers'

export function useRemoveMember(companyId: string, userId: string, companySlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () =>
            apiClient<void>(`company/${companyId}/user/${userId}`, { method: 'DELETE' }),
        onSuccess: () => {
            toast.success('Member removed')
            queryClient.setQueryData<CompanyDetails>(
                [COMPANY_DETAILS, companySlug],
                old => old && { ...old, members: old.members.filter(m => m.id !== userId) },
            )
            queryClient.invalidateQueries({ queryKey: [INVITABLE_USERS, companyId] })
        },
        onError: () => {
            toast.error('Something went wrong')
        },
    })
}
