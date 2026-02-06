'use client'

import { AuthProvider } from '@/contexts/authContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                {children} <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}
