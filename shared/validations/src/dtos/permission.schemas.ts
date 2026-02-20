export const PERMISSION = {
    owner: {
        id: 4,
        level: 4,
    },
    admin: {
        id: 3,
        level: 3,
    },
    maintainer: {
        id: 2,
        level: 2,
    },
    guest: {
        id: 1,
        level: 1,
    },
} as const

export type PermissionName = keyof typeof PERMISSION
