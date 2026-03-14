import { PERMISSION, PossiblePermissionName, ProjectMember } from '@shared/validations'
import { useRef, useState } from 'react'

export function useManageProjectPermission(member: ProjectMember) {
    const previousPermissionRef = useRef<PossiblePermissionName | null>(null)
    const [optimisticPermission, setOptimisticPermission] = useState<PossiblePermissionName | null>(
        null,
    )

    // Highest permission coming from workspace or company (the inherited "floor")
    const inheritedPermLevel = Math.max(
        member.workspacePermissionName ? PERMISSION[member.workspacePermissionName].level : 0,
        member.companyPermissionName ? PERMISSION[member.companyPermissionName].level : 0,
    )

    // Effective permission: highest across all three levels
    const derivedPermission = (() => {
        const candidates: PossiblePermissionName[] = []
        if (member.projectPermissionName) candidates.push(member.projectPermissionName)
        if (member.workspacePermissionName) candidates.push(member.workspacePermissionName)
        if (member.companyPermissionName) candidates.push(member.companyPermissionName)
        if (candidates.length === 0) return null
        return candidates.reduce((best, current) =>
            PERMISSION[current].level > PERMISSION[best].level ? current : best,
        )
    })()

    const effectivePermission = optimisticPermission ?? derivedPermission

    // Inherited: no explicit project permission, or a higher-level permission overrides the project one
    const isInherited =
        !member.projectPermissionName ||
        inheritedPermLevel > PERMISSION[member.projectPermissionName].level

    // Only offer permissions at or above the inherited floor
    const availablePermissions = Object.entries(PERMISSION).filter(
        ([, perm]) => perm.level >= inheritedPermLevel,
    )

    const onPermissionChange = (newPermission: PossiblePermissionName) => {
        previousPermissionRef.current = derivedPermission
        setOptimisticPermission(newPermission)
    }

    const onPermissionChangeError = () => {
        setOptimisticPermission(previousPermissionRef.current)
    }

    const onPermissionChangeSuccess = () => {
        setOptimisticPermission(null)
    }

    return {
        effectivePermission,
        isInherited,
        availablePermissions,
        onPermissionChange,
        onPermissionChangeError,
        onPermissionChangeSuccess,
    }
}
