'use client'

import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
