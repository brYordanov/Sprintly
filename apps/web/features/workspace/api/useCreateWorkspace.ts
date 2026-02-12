import { apiClient } from '@/lib/api/client'
import { CreateWorkspaceDto, WorkspaceRowDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { USER_WORKSPACES } from './useGetViewableUserWorkspaces'

export function useCreateWorkspace() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateWorkspaceDto) =>
            apiClient<WorkspaceRowDto>('workspace', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast.success('Workspace created')
            queryClient.invalidateQueries({ queryKey: [USER_WORKSPACES] })
        },
        onError: err => {
            console.error(`Workspace creation failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
