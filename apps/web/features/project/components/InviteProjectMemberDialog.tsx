import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { InputWithIcon } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { SelectedUsersPermissionSet } from '@/features/workspace/components/SelectedUsersPermissionSet'
import { UnselectedUserOption } from '@/features/workspace/components/UnselectedUserOption'
import { useManageMemberInviteSelection } from '@/features/workspace/hooks/useManageMemberInviteSelection'
import { Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useAddProjectMember } from '../api/useAddProjectMember'
import { useGetInvitableProjectUsers } from '../api/useGetInvitableProjectUsers'

interface InviteProjectMemberDialogProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    projectId: string
    projectSlug: string
}

export function InviteProjectMemberDialog({
    isOpen,
    onOpenChange,
    projectId,
    projectSlug,
}: InviteProjectMemberDialogProps) {
    const [query, setQuery] = useState('')
    const debouncedValue = useDebounce(query, 300)
    const { data: users = [], isLoading } = useGetInvitableProjectUsers(projectId, debouncedValue)
    const { selections, selectedIds, unselectedUsers, select, deselect, setPermission, clearAll } =
        useManageMemberInviteSelection(users)
    const { mutate: addMembers } = useAddProjectMember(projectId, projectSlug)

    const handleInvite = () => {
        onOpenChange(false)
        addMembers({
            nonMembers: Object.values(selections).map(({ user, permissionId }) => ({
                userId: user.id,
                permissionId,
            })),
        })
        clearAll()
        setQuery('')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus />
                        Invite Members
                    </DialogTitle>
                    <DialogDescription>
                        Search for users to invite to this project.
                    </DialogDescription>
                </DialogHeader>

                <InputWithIcon
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                    Icon={Search}
                />

                <div className="max-h-44 overflow-y-auto">
                    {isLoading && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Searching.....
                        </p>
                    )}
                    {!isLoading && users.length > 0 && unselectedUsers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            All results already selected.
                        </p>
                    )}
                    {!isLoading && users.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No users found.
                        </p>
                    )}
                    {unselectedUsers.map(user => (
                        <UnselectedUserOption
                            key={user.id}
                            user={user}
                            onClick={() => select(user)}
                        />
                    ))}
                </div>

                {selectedIds.length > 0 && (
                    <SelectedUsersPermissionSet
                        selectedIds={selectedIds}
                        selections={selections}
                        onPermissionSelect={setPermission}
                        onDeselectOption={deselect}
                    />
                )}

                <div className="flex justify-end pt-1">
                    <Button
                        disabled={selectedIds.length === 0}
                        onClick={handleInvite}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4 mr-1 text-white" />
                        Invite{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
