'use client'

import { AuthProvider } from '@/contexts/authContext'
import { UserPublicDto } from '@shared/validations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export function Providers({
    children,
    initialUser,
}: {
    children: React.ReactNode
    initialUser: UserPublicDto | null
}) {
    return (
        <AuthProvider initialUser={initialUser}>
            <QueryClientProvider client={queryClient}>
                {children} <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}
