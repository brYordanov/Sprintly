import { apiClient } from '@/lib/api/client'
import { AddProjectMemberDto, ProjectDetails, ProjectMember } from '@shared/validations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PROJECT_DETAILS } from './useGetProjectDetails'
import { INVITABLE_PROJECT_USERS } from './useGetInvitableProjectUsers'

export function useAddProjectMember(projectId: string, projectSlug: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: AddProjectMemberDto) =>
            apiClient<ProjectMember[]>(`project/${projectId}/add-member`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: addedMembers => {
            toast.success(`${addedMembers.length} member${addedMembers.length > 1 ? 's' : ''} added`)
            queryClient.setQueryData<ProjectDetails>(
                [PROJECT_DETAILS, projectSlug],
                old => old && { ...old, members: [...old.members, ...addedMembers] },
            )
            queryClient.invalidateQueries({ queryKey: [INVITABLE_PROJECT_USERS, projectId] })
        },
        onError: err => {
            console.error(`Adding project member failed: ${err}`)
            toast.error('Something went wrong')
        },
    })
}
