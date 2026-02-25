import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { InputWithIcon } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/helpers'
import { useDebounce } from '@/hooks/useDebounce'
import { PERMISSION, WorkspaceNonMember } from '@shared/validations'
import { X, Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useAddWorkspaceMember } from '../api/useAddWorkspaceMember'
import { useGetInvitableWorkspaceUsers } from '../api/useGetInvitableWorkspaceUsers'

const PERMISSION_OPTIONS = [
    { label: 'Guest', value: PERMISSION.guest.id },
    { label: 'Maintainer', value: PERMISSION.maintainer.id },
    { label: 'Admin', value: PERMISSION.admin.id },
    { label: 'Owner', value: PERMISSION.owner.id },
] as const

type Selection = { user: WorkspaceNonMember; permissionId: number }

interface InviteWorkspaceMemberDialogProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    workspaceId: string
    workspaceSlug: string
}

export function InviteWorkspaceMemberDialog({
    isOpen,
    onOpenChange,
    workspaceId,
    workspaceSlug,
}: InviteWorkspaceMemberDialogProps) {
    const [query, setQuery] = useState('')
    const debouncedValue = useDebounce(query, 300)
    const { data: users = [], isLoading } = useGetInvitableWorkspaceUsers(workspaceId, debouncedValue)
    const [selections, setSelections] = useState<Record<string, Selection>>({})
    const { mutate: addMembers } = useAddWorkspaceMember(workspaceId, workspaceSlug)

    const selectedIds = Object.keys(selections)
    const unselectedUsers = users.filter(u => !selections[u.id])

    const select = (user: WorkspaceNonMember) =>
        setSelections(prev => ({ ...prev, [user.id]: { user, permissionId: PERMISSION.guest.id } }))

    const deselect = (userId: string) =>
        setSelections(prev => {
            const next = { ...prev }
            delete next[userId]
            return next
        })

    const setPermission = (userId: string, permissionId: number) =>
        setSelections(prev => ({
            ...prev,
            [userId]: { ...prev[userId], permissionId },
        }))

    const handleInvite = () => {
        onOpenChange(false)
        addMembers({
            nonMembers: Object.values(selections).map(({ user, permissionId }) => ({
                userId: user.id,
                permissionId,
            })),
        })
        setSelections({})
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
                        Search for users to invite to this workspace.
                    </DialogDescription>
                </DialogHeader>

                <InputWithIcon
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                    Icon={Search}
                />

                {/* Search results */}
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
                        <button
                            key={user.id}
                            onClick={() => select(user)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer hover:shadow-soft"
                        >
                            <Avatar className="h-8 w-8 shrink-0">
                                {user.avatarUrl && (
                                    <AvatarImage
                                        src={user.avatarUrl}
                                        alt={user.username}
                                        className="object-cover"
                                    />
                                )}
                                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                                    {getInitials(user.fullname ?? user.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user.fullname ?? user.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Selected users */}
                {selectedIds.length > 0 && (
                    <div className="border-t border-border pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            Selected ({selectedIds.length})
                        </p>
                        <div className="max-h-44 overflow-y-auto space-y-1">
                            {Object.values(selections).map(({ user, permissionId }) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5"
                                >
                                    <Avatar className="h-7 w-7 shrink-0">
                                        {user.avatarUrl && (
                                            <AvatarImage
                                                src={user.avatarUrl}
                                                alt={user.username}
                                                className="object-cover"
                                            />
                                        )}
                                        <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                                            {getInitials(user.fullname ?? user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium truncate flex-1">
                                        {user.fullname ?? user.username}
                                    </p>
                                    <Select
                                        value={String(permissionId)}
                                        onValueChange={v => setPermission(user.id, Number(v))}
                                    >
                                        <SelectTrigger className="w-30 h-7 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PERMISSION_OPTIONS.map(opt => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={String(opt.value)}
                                                    className="text-xs"
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <button
                                        onClick={() => deselect(user.id)}
                                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
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
