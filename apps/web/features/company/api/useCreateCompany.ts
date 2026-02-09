import { apiClient } from '@/lib/api/client'
import { CompanyRowDto, CreateCompanyDto } from '@shared/validations'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateCompany() {
    return useMutation({
        mutationFn: async (data: CreateCompanyDto) =>
            apiClient<CompanyRowDto>('company', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast.success('Company created')
        },
        onError: err => {
            console.error(`Company creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
