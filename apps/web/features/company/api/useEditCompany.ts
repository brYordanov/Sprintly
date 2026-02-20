import { apiClient } from '@/lib/api/client'
import { CompanyDetails, CompanyRowDto, EditCompanyDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { COMPANY_DETAILS } from './useGetCompanyDetails'
import { VIEWABLE_USER_COMPANIES } from './useGetViewableUserCompanies'

export function useEditCompany(companyId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: EditCompanyDto) =>
            apiClient<CompanyRowDto>(`company/${companyId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: updatedCompany => {
            toast.success('Company updated')
            queryClient.invalidateQueries({ queryKey: [VIEWABLE_USER_COMPANIES] })
            queryClient.setQueriesData<CompanyDetails>(
                { queryKey: [COMPANY_DETAILS] },
                old => old && { ...old, company: updatedCompany },
            )
        },
        onError: err => {
            console.error(`Company update failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
