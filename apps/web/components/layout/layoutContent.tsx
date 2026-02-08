'use client'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/authContext'
import { AuthenticatedHeader } from './authenticatedHeader'
import { Header } from './header'
import { AppSidebar } from './sidebar'

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                {children}
            </>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AuthenticatedHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
