import { apiClient } from '@/lib/api/client'
import { CompanyRowDto, EditCompanyDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { VIEWABLE_USER_COMPANIES } from './useGetViewableUserCompanies'

export function useEditCompany(companyId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: EditCompanyDto) =>
            apiClient<CompanyRowDto>(`company/${companyId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast.success('Company updated')
            queryClient.invalidateQueries({ queryKey: [VIEWABLE_USER_COMPANIES] })
        },
        onError: err => {
            console.error(`Company update failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
