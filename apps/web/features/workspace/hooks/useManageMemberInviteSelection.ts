import { PERMISSION, WorkspaceNonMember } from '@shared/validations'
import { useState } from 'react'

export type Selection = { user: WorkspaceNonMember; permissionId: number }

export function useManageMemberInviteSelection(users: WorkspaceNonMember[]) {
    const [selections, setSelections] = useState<Record<string, Selection>>({})
    const selectedIds = Object.keys(selections)
    const unselectedUsers = users.filter(u => !selections[u.id])

    const select = (user: WorkspaceNonMember) =>
        setSelections(prev => ({ ...prev, [user.id]: { user, permissionId: PERMISSION.guest.id } }))

    const deselect = (userId: string) =>
        setSelections(prev => {
            const next = { ...prev }
            delete next[userId]
            return next
        })

    const setPermission = (userId: string, permissionId: number) =>
        setSelections(prev => ({
            ...prev,
            [userId]: { ...prev[userId], permissionId },
        }))

    const clearAll = () => {
        setSelections({})
    }

    return {
        selections,
        selectedIds,
        unselectedUsers,
        select,
        deselect,
        setPermission,
        clearAll,
    }
}
