import { apiClient } from '@/lib/api/client'
import { CreateProjectDto, ProjectRowDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { USER_PROJECTS } from './useGetUserProjects'

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateProjectDto) =>
            apiClient<ProjectRowDto>('project', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast.success('Company created')
            queryClient.invalidateQueries({ queryKey: [USER_PROJECTS] })
        },
        onError: err => {
            console.error(`Company creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
