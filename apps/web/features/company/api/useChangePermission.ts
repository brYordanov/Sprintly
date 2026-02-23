import { apiClient } from '@/lib/api/client'
import { ChangePermissionDto, CompanyDetails, CompanyMember } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { COMPANY_DETAILS } from './useGetCompanyDetails'

export function useChangePermission(companyId: string, userId: string, companySlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ChangePermissionDto) =>
            apiClient<CompanyMember>(`company/${companyId}/user/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: updatedMember => {
            toast.success('User permission changed')
            queryClient.setQueryData<CompanyDetails>(
                [COMPANY_DETAILS, companySlug],
                old =>
                    old && {
                        ...old,
                        members: old.members.map(m =>
                            m.id === updatedMember.id ? updatedMember : m,
                        ),
                    },
            )
        },
    })
}
