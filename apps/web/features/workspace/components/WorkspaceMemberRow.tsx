import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/helpers'
import { PERMISSION, PossiblePermissionName, WorkspaceMember } from '@shared/validations'
import { toast } from 'sonner'
import { useChangeWorkspacePermission } from '../api/useChangeWorkspacePermission'
import { useRemoveWorkspaceMember } from '../api/useRemoveWorkspaceMember'
import { useManageWorkspacePermission } from '../hooks/useManageWorkspacePermission'

interface WorkspaceMemberRowProps {
    member: WorkspaceMember
    workspaceId: string
    workspaceSlug: string
}

export function WorkspaceMemberRow({
    member,
    workspaceId,
    workspaceSlug,
}: WorkspaceMemberRowProps) {
    const {
        effectivePermission,
        isCompanyOwnerOrAdmin,
        isInherited,
        availablePermissions,
        onPermissionChange,
        onInvalidChange,
        onValidChange,
    } = useManageWorkspacePermission(member)

    const { mutate: changePermission } = useChangeWorkspacePermission(
        workspaceId,
        member.id,
        workspaceSlug,
    )
    const { mutate: removeMember, isPending: isRemoving } = useRemoveWorkspaceMember(
        workspaceId,
        workspaceSlug,
    )

    function handlePermissionChange(newPermission: PossiblePermissionName) {
        onPermissionChange(newPermission)
        changePermission(
            { permissionId: PERMISSION[newPermission].id },
            {
                onSuccess: () => onValidChange(),
                onError: () => {
                    onInvalidChange()
                    toast.error('Failed to update permission')
                },
            },
        )
    }

    return (
        <tr>
            <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                        {member.avatarUrl && (
                            <AvatarImage src={member.avatarUrl} alt={member.fullname ?? 'avatar'} />
                        )}
                        <AvatarFallback className="text-xs">
                            {getInitials(member.fullname)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.fullname}</span>
                </div>
            </td>
            <td className="py-3 pr-4">
                <span className="text-sm text-muted-foreground">{member.email}</span>
            </td>
            <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                    <Select
                        value={effectivePermission ?? ''}
                        disabled={isCompanyOwnerOrAdmin}
                        onValueChange={handlePermissionChange}
                    >
                        <SelectTrigger className="w-36 h-8 text-sm cursor-pointer">
                            <SelectValue placeholder=""></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {availablePermissions.map(([name]) => (
                                <SelectItem key={name} value={name} className="text-sm">
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isInherited && (
                        <Badge variant="outline" className="text-xs">
                            Inherited
                        </Badge>
                    )}
                </div>
            </td>
            {!isInherited && (
                <td className="py-3 text-right">
                    <AlertDialog>
                        <AlertDialogTrigger
                            disabled={isRemoving}
                            className="text-sm text-destructive hover:text-destructive/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Remove
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove member</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to remove{' '}
                                    <span className="font-medium text-foreground">
                                        {member.fullname}
                                    </span>{' '}
                                    from this workspace?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={() => removeMember(member.id)}
                                >
                                    Remove
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </td>
            )}
        </tr>
    )
}
