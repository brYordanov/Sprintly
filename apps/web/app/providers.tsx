'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { getQueryClient } from '@/lib/get-query-client'
import { UserPublicDto } from '@shared/validations'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

export function Providers({
    children,
    initialUser,
}: {
    children: React.ReactNode
    initialUser: UserPublicDto | null
}) {
    const queryClient = getQueryClient()
    return (
        <AuthProvider initialUser={initialUser}>
            <QueryClientProvider client={queryClient}>
                {children} <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}
