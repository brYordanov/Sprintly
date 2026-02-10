import { apiClient } from '@/lib/api/client'
import { CreateWorkspaceDto, WorkspaceRowDto } from '@shared/validations'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateWorkspace() {
    return useMutation({
        mutationFn: async (data: CreateWorkspaceDto) =>
            apiClient<WorkspaceRowDto>('workspace', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast.success('Workspace created')
        },
        onError: err => {
            console.error(`Workspace creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
