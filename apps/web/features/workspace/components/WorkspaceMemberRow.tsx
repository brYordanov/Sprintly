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
import { getInitials } from '@/helpers'
import { WorkspaceMember } from '@shared/validations'
import { useRemoveWorkspaceMember } from '../api/useRemoveWorkspaceMember'

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
    const effectivePermission = member.workspacePermissionName ?? member.companyPermissionName
    const isInherited = !member.workspacePermissionName && !!member.companyPermissionName
    const { mutate: removeMember, isPending: isRemoving } = useRemoveWorkspaceMember(
        workspaceId,
        workspaceSlug,
    )

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
                    {effectivePermission && (
                        <span className="text-sm capitalize">{effectivePermission}</span>
                    )}
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
