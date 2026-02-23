import { apiClient } from '@/lib/api/client'
import { AddMemberDto, CompanyDetails, CompanyMember } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { COMPANY_DETAILS } from './useGetCompanyDetails'
import { INVITABLE_USERS } from './useGetInvitableUsers'

export function useAddMember(companyId: string, companySlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: AddMemberDto) =>
            apiClient<CompanyMember>(`company/${companyId}/add-member`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: addedMember => {
            toast.success('Member added')
            queryClient.setQueryData<CompanyDetails>(
                [COMPANY_DETAILS, companySlug],
                old => old && { ...old, members: [...old.members, addedMember] },
            )

            queryClient.invalidateQueries({ queryKey: [INVITABLE_USERS, companyId] })
        },
        onError: err => {
            console.error(`Adding member failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
