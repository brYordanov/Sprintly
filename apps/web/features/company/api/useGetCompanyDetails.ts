import { apiClient, ApiError } from '@/lib/api/client'
import { CompanyDetails } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const COMPANY_DETAILS = 'companyDetails' as const

export function useGetCompanyDetails(companySlug: string) {
    return useQuery<CompanyDetails, ApiError>({
        queryKey: [COMPANY_DETAILS, companySlug],
        queryFn: async () => apiClient<CompanyDetails>(`company/${companySlug}/details`),
    })
}
