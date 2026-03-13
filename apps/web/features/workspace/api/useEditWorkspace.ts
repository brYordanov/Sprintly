import { apiClient } from '@/lib/api/client'
import { EditWorkspaceDto, WorkspaceDetails, WorkspaceRowDto } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WORKSPACE_DETAILS } from './useGetWorkspaceDetails'

export function useEditWorkspace(workspaceId: string, workspaceSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: EditWorkspaceDto) =>
            apiClient<WorkspaceRowDto>(`workspace/${workspaceId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: updatedWorkspace => {
            toast.success('Workspace updated')
            queryClient.setQueriesData<WorkspaceDetails>(
                { queryKey: [WORKSPACE_DETAILS, workspaceSlug] },
                old => old && { ...old, workspace: updatedWorkspace },
            )
        },
        onError: err => {
            console.error(`Workspace update failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
