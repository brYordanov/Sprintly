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
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useChangeWorkspacePermission } from '../api/useChangeWorkspacePermission'
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
    // caching error
    // play with permissions
    const previousPermissionRef = useRef<PossiblePermissionName | null>(null)
    const [effectivePermission, setEffectivePermission] = useState<PossiblePermissionName | null>(
        () => {
            console.log('+++++ Inside setter ++++++++')
            console.log(member.email)
            if (!!member.companyPermissionName && !!member.workspacePermissionName) {
                const permission =
                    PERMISSION[member.companyPermissionName].level >
                    PERMISSION[member.workspacePermissionName].level
                        ? member.companyPermissionName
                        : member.workspacePermissionName

                console.log(permission)
                console.log('-------- Inside setter ------')

                return permission
            } else if (!!member.companyPermissionName && !member.workspacePermissionName)
                return member.companyPermissionName

            return member.workspacePermissionName
        },
    )

    const { mutate: changePermission } = useChangeWorkspacePermission(
        workspaceId,
        member.id,
        workspaceSlug,
    )
    const { mutate: removeMember, isPending: isRemoving } = useRemoveWorkspaceMember(
        workspaceId,
        workspaceSlug,
    )

    const companyPermLevel = member.companyPermissionId
        ? (Object.values(PERMISSION).find(p => p.id === member.companyPermissionId)?.level ?? 0)
        : 0

    const isCompanyOwnerOrAdmin = companyPermLevel >= PERMISSION.admin.level
    console.log(' ++++++++ inherit ++++++++')
    console.log(member.email)

    const isInherited =
        (!member.workspacePermissionName && !!member.companyPermissionName) ||
        (!!member.companyPermissionName &&
            !!member.workspacePermissionName &&
            PERMISSION[member.companyPermissionName].level >
                PERMISSION[member.workspacePermissionName].level)

    console.log(member.companyPermissionName)

    console.log(member.workspacePermissionName)

    console.log('----- inherit ------')

    const availablePermissions = Object.entries(PERMISSION).filter(
        ([, perm]) => perm.level >= companyPermLevel,
    )

    const onPermissionChange = (newPermission: PossiblePermissionName) => {
        previousPermissionRef.current = effectivePermission
        setEffectivePermission(newPermission)
        changePermission(
            { permissionId: PERMISSION[newPermission].id },
            {
                onError: () => {
                    setEffectivePermission(previousPermissionRef.current)
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
                        onValueChange={onPermissionChange}
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
