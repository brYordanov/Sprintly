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
import { getInitials } from '@/helpers'
import { useDebounce } from '@/hooks/useDebounce'
import { CompanyNonMember } from '@shared/validations'
import { Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useGetInvitableUsers } from '../api/useGetInvitableUsers'

interface InviteMembersDialogProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    companyId: string
}
export function InviteMemberDialog({ isOpen, onOpenChange, companyId }: InviteMembersDialogProps) {
    const [query, setQuery] = useState('')
    const debouncedValue = useDebounce(query, 300)

    const { data: users = [], isLoading } = useGetInvitableUsers(companyId, debouncedValue)

    const [selectedUser, setSelectedUser] = useState<CompanyNonMember | null>(null)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus />
                        Invite Members
                    </DialogTitle>
                    <DialogDescription>
                        Search for users to invite to this company.
                    </DialogDescription>
                </DialogHeader>
                <InputWithIcon
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value)
                        setSelectedUser(null)
                    }}
                    autoFocus
                    Icon={Search}
                />
                <div>
                    {isLoading && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Searching.....
                        </p>
                    )}
                    {!isLoading && users.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No users found.
                        </p>
                    )}

                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() =>
                                setSelectedUser(prev => (prev?.id === user.id ? null : user))
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${selectedUser?.id === user.id ? 'bg-primary/10 hover:shadow-soft' : 'hover:shadow-soft'}`}
                        >
                            <Avatar className="h-20 w-20" size="lg">
                                {user.avatarUrl && (
                                    <AvatarImage
                                        src={user.avatarUrl}
                                        alt={user.username}
                                        className="object-cover"
                                    />
                                )}
                                <AvatarFallback className="bg-blue-600 text-white font-semibold">
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
                <div className="flex justify-end pt-2">
                    <Button
                        disabled={!selectedUser}
                        onClick={() => {}}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4 mr-1 text-white" />
                        Invite
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
