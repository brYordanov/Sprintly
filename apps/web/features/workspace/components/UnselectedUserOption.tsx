import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/helpers'
import { WorkspaceNonMember } from '@shared/validations'

export function UnselectedUserOption({
    user,
    onClick,
}: {
    user: WorkspaceNonMember
    onClick: () => any
}) {
    return (
        <button
            key={user.id}
            onClick={onClick}
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
                <AvatarFallback className="bg-primary text-white font-semibold text-xs">
                    {getInitials(user.fullname ?? user.username)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {user.fullname ?? user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
        </button>
    )
}
