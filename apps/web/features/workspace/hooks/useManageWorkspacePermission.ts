import { PERMISSION, PossiblePermissionName, WorkspaceMember } from '@shared/validations'
import { useRef, useState } from 'react'

export function useManageWorkspacePermission(member: WorkspaceMember) {
    const previousPermissionRef = useRef<PossiblePermissionName | null>(null)
    const [optimisticPermission, setOptimisticPermission] = useState<PossiblePermissionName | null>(
        null,
    )

    const derivedPermission = (() => {
        if (member.companyPermissionName && member.workspacePermissionName) {
            return PERMISSION[member.companyPermissionName].level >
                PERMISSION[member.workspacePermissionName].level
                ? member.companyPermissionName
                : member.workspacePermissionName
        } else if (member.companyPermissionName) {
            return member.companyPermissionName
        }
        return member.workspacePermissionName
    })()

    const effectivePermission = optimisticPermission ?? derivedPermission

    const companyPermLevel = member.companyPermissionId
        ? (Object.values(PERMISSION).find(p => p.id === member.companyPermissionId)?.level ?? 0)
        : 0
    const isCompanyOwnerOrAdmin = companyPermLevel >= PERMISSION.admin.level

    const isInherited =
        (!member.workspacePermissionName && !!member.companyPermissionName) ||
        (!!member.companyPermissionName &&
            !!member.workspacePermissionName &&
            PERMISSION[member.companyPermissionName].level >
                PERMISSION[member.workspacePermissionName].level)

    const availablePermissions = Object.entries(PERMISSION).filter(
        ([, perm]) => perm.level >= companyPermLevel,
    )

    const onPermissionChange = (newPermission: PossiblePermissionName) => {
        previousPermissionRef.current = derivedPermission
        setOptimisticPermission(newPermission)
    }

    const onInvalidChange = () => {
        setOptimisticPermission(previousPermissionRef.current)
    }

    const onValidChange = () => {
        setOptimisticPermission(null)
    }

    return {
        effectivePermission,
        isCompanyOwnerOrAdmin,
        isInherited,
        availablePermissions,
        onPermissionChange,
        onInvalidChange,
        onValidChange,
    }
}
