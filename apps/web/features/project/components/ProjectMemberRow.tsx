import { RemoveMemberDialog } from '@/components/dialogs/RemoveMemberDialog'
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
import { PERMISSION, PossiblePermissionName, ProjectMember } from '@shared/validations'
import { toast } from 'sonner'
import { useChangeProjectPermission } from '../api/useChangeProjectPermission'
import { useRemoveProjectMember } from '../api/useRemoveProjectMember'
import { useManageProjectPermission } from '../hooks/useManageProjectPermission'

interface ProjectMemberRowProps {
    member: ProjectMember
    projectId: string
    projectSlug: string
    currentUserEffectivePermissionLevel: number
}

export function ProjectMemberRow({
    member,
    projectId,
    projectSlug,
    currentUserEffectivePermissionLevel,
}: ProjectMemberRowProps) {
    const {
        effectivePermission,
        isInherited,
        availablePermissions,
        onPermissionChange,
        onPermissionChangeError,
        onPermissionChangeSuccess,
    } = useManageProjectPermission(member)

    const { mutate: changePermission } = useChangeProjectPermission(
        projectId,
        member.id,
        projectSlug,
    )
    const { mutate: removeMember, isPending: isRemoving } = useRemoveProjectMember(
        projectId,
        projectSlug,
    )

    function handlePermissionChange(newPermission: PossiblePermissionName) {
        onPermissionChange(newPermission)
        changePermission(
            { permissionId: PERMISSION[newPermission].id },
            {
                onSuccess: () => onPermissionChangeSuccess(),
                onError: () => {
                    onPermissionChangeError()
                    toast.error('Failed to update permission')
                },
            },
        )
    }

    return (
        <tr>
            <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-20 w-20" size="lg">
                        {member.avatarUrl && (
                            <AvatarImage
                                src={member.avatarUrl}
                                alt={member.username}
                                className="object-cover"
                            />
                        )}
                        <AvatarFallback className="bg-primary text-white font-semibold">
                            {getInitials(member.fullname ?? member.username)}
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
                        disabled={
                            isInherited ||
                            currentUserEffectivePermissionLevel < PERMISSION.admin.level
                        }
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
            {!isInherited && currentUserEffectivePermissionLevel >= PERMISSION.admin.level && (
                <td className="py-3 text-right">
                    <RemoveMemberDialog
                        memberName={member.fullname}
                        context="project"
                        isRemoving={isRemoving}
                        onConfirm={() => removeMember(member.id)}
                    />
                </td>
            )}
        </tr>
    )
}
