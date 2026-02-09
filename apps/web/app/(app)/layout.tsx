'use client'

import { AuthenticatedHeader } from '@/components/layout/authenticatedHeader'
import { AppSidebar } from '@/components/layout/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
