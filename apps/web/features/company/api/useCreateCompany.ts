import { apiClient } from '@/lib/api/client'
import { CompanyRowDto, CreateCompanyDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { USER_COMPANIES } from './useGetUserCompanies'

export function useCreateCompany() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: CreateCompanyDto) =>
            apiClient<CompanyRowDto>('company', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast.success('Company created')
            queryClient.invalidateQueries({ queryKey: [USER_COMPANIES] })
        },
        onError: err => {
            console.error(`Company creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
