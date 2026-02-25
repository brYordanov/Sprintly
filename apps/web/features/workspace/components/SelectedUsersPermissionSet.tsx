import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/helpers'
import { PERMISSION } from '@shared/validations'
import { X } from 'lucide-react'
import { Selection } from '../hooks/useManageMemberInviteSelection'

interface SelectedUsersPermissionSetProps {
    selectedIds: string[]
    selections: Record<string, Selection>
    onPermissionSelect: (userId: string, permissionId: number) => void
    onDeselectOption: (userId: string) => void
}

export function SelectedUsersPermissionSet({
    selectedIds,
    selections,
    onPermissionSelect,
    onDeselectOption,
}: SelectedUsersPermissionSetProps) {
    return (
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
                            onValueChange={v => onPermissionSelect(user.id, Number(v))}
                        >
                            <SelectTrigger className="w-30 h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PERMISSION).map(([name, values]) => (
                                    <SelectItem
                                        key={values.id}
                                        value={String(values.id)}
                                        className="text-xs"
                                    >
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <button
                            onClick={() => onDeselectOption(user.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
