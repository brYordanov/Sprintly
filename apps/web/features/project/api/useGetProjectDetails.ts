import { apiClient, ApiError } from '@/lib/api/client'
import { ProjectDetails } from '@shared/validations'
import { useQuery } from '@tanstack/react-query'

export const PROJECT_DETAILS = 'projectDetails'

export function useGetProjectDetails(projectSlug: string) {
    return useQuery<ProjectDetails, ApiError>({
        queryKey: [PROJECT_DETAILS, projectSlug],
        queryFn: async () => apiClient<ProjectDetails>(`project/${projectSlug}/details`),
    })
}
