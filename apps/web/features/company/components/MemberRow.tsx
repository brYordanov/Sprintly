import { RemoveMemberDialog } from '@/components/dialogs/RemoveMemberDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/helpers'
import { CompanyMember, PERMISSION, PossiblePermissionName } from '@shared/validations'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useChangePermission } from '../api/useChangePermission'
import { useRemoveMember } from '../api/useRemoveMember'

export function MemberRow({
    member,
    companyId,
    companySlug,
}: {
    member: CompanyMember
    companyId: string
    companySlug: string
}) {
    const [currentPermission, setCurrentPermission] = useState(member.permissionName)
    const previousPermissionRef = useRef<string | null>(null)
    const { mutate: changePermission } = useChangePermission(companyId, member.id, companySlug)
    const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(
        companyId,
        member.id,
        companySlug,
    )

    const onPermissionChange = (newPermission: PossiblePermissionName) => {
        previousPermissionRef.current = currentPermission
        setCurrentPermission(newPermission)
        changePermission(
            { permissionId: PERMISSION[newPermission].id },
            {
                onError: () => {
                    setCurrentPermission(previousPermissionRef.current)
                    toast.error('Failed to update permission')
                },
            },
        )
    }

    return (
        <tr key={member.id}>
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
                        <AvatarFallback className="bg-blue-600 text-white font-semibold">
                            {getInitials(member.fullname ?? member.username)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                        {member.fullname ?? member.username}
                    </span>
                </div>
            </td>
            <td className="py-3 pr-4">
                <span className="text-sm text-muted-foreground">{member.email}</span>
            </td>
            <td className="py-3 pr-4">
                <Select
                    value={currentPermission ?? undefined}
                    disabled={member.permissionId === PERMISSION.owner.id}
                    onValueChange={onPermissionChange}
                >
                    <SelectTrigger className="w-36 h-8 text-sm cursor-pointer">
                        <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(PERMISSION).map(([name]) => (
                            <SelectItem key={name} value={name} className="text-sm">
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>
            {member.permissionId !== PERMISSION.owner.id && (
                <td className="py-3 text-right">
                    <RemoveMemberDialog
                        memberName={member.fullname ?? member.username}
                        context="company"
                        isRemoving={isRemoving}
                        onConfirm={() => removeMember()}
                    />
                </td>
            )}
        </tr>
    )
}
