// components/app-sidebar.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/features/auth/api/useLogout'
import { useGetViewableUserCompanies } from '@/features/company/api/useGetViewableUserCompanies'
import { CreateCompanyDialog } from '@/features/company/components/CreateCompanyDialog'
import { useGetUserProjects } from '@/features/project/api/useGetUserProjects'
import { CreateProjectDialog } from '@/features/project/components/CreateProjectDialog'
import { useGetViewableUserWorkspaces } from '@/features/workspace/api/useGetViewableUserWorkspaces'
import { CreateWorkspaceDialog } from '@/features/workspace/components/CreateWorkspaceDialog'
import { getInitials } from '@/helpers'
import { cn } from '@/lib/utils'
import {
    Building2,
    ChevronDown,
    FolderKanban,
    Layers,
    LayoutDashboard,
    LogOut,
    Plus,
    Settings,
    User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ProjectSymbol } from '../ui/icon'

const dashboardItems = [{ title: 'Overview', url: '/dashboard', icon: LayoutDashboard }]

export function AppSidebar() {
    const { user } = useAuth()
    const { mutate: logout } = useLogout()
    const { state } = useSidebar()
    const pathname = usePathname()
    const collapsed = state === 'collapsed'
    const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false)
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
    const { data: userCompanies } = useGetViewableUserCompanies()
    const { data: userWorkspaces } = useGetViewableUserWorkspaces()
    const { data: userProjects } = useGetUserProjects()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Link href="/dashboard" className="flex items-center">
                    {collapsed ? (
                        <ProjectSymbol width={40} height={40} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <ProjectSymbol width={40} height={40} />
                            <span className="text-lg font-bold text-foreground">Sprintly</span>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarSeparator className="m-0" />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {dashboardItems.map(item => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                'hover:bg-sidebar-accent/50',
                                                pathname === item.url &&
                                                    'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="m-0" />

                <CollapsibleSection
                    label="My Companies"
                    icon={Building2}
                    items={
                        userCompanies?.map(c => ({
                            title: c.name,
                            url: `/company/${c.slug}`,
                        })) ?? []
                    }
                    pathname={pathname}
                    defaultOpen
                    isMenuCollapsed={collapsed}
                    onAddClick={() => setIsCreateCompanyOpen(true)}
                />

                <SidebarSeparator className="m-0" />

                <CollapsibleSection
                    label="My Workspaces"
                    icon={Layers}
                    items={
                        userWorkspaces?.map(w => ({
                            title: w.name,
                            url: `company/${w.companySlug}/workspace/${w.slug}`,
                        })) ?? []
                    }
                    pathname={pathname}
                    defaultOpen
                    isMenuCollapsed={collapsed}
                    onAddClick={() => setIsCreateWorkspaceOpen(true)}
                />

                <SidebarSeparator className="m-0" />

                <CollapsibleSection
                    label="My Projects"
                    icon={FolderKanban}
                    items={
                        userProjects?.map(p => ({
                            title: p.name,
                            url: p.workspaceSlug
                                ? `company/${p.companySlug}/workspace/${p.workspaceSlug}/project/${p.slug}`
                                : `company/${p.companySlug}/project/${p.slug}`,
                        })) ?? []
                    }
                    pathname={pathname}
                    defaultOpen
                    isMenuCollapsed={collapsed}
                    onAddClick={() => setIsCreateProjectOpen(true)}
                />
            </SidebarContent>

            <SidebarSeparator className="m-0" />

            <SidebarFooter className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={user?.avatarUrl || undefined}
                                            alt={user?.fullname || user?.username}
                                        />
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                                            {getInitials(user?.fullname || user?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {user?.fullname || user?.username || 'User'}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user?.email || 'user@example.com'}
                                            </span>
                                        </div>
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild className="group">
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="group-hover:text-white" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="group">
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="group-hover:text-white" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="cursor-pointer group"
                                >
                                    <LogOut className="group-hover:text-white" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <CreateCompanyDialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen} />
            <CreateWorkspaceDialog
                open={isCreateWorkspaceOpen}
                onOpenChange={setIsCreateWorkspaceOpen}
            />
            <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
        </Sidebar>
    )
}

interface CollapsibleSectionProps {
    label: string
    icon: React.ComponentType<{ className?: string }>
    items: { title: string; url: string }[]
    pathname: string
    isMenuCollapsed: boolean
    defaultOpen?: boolean
    onAddClick?: () => void
}

function CollapsibleSection({
    label,
    icon: Icon,
    items,
    pathname,
    isMenuCollapsed,
    defaultOpen = false,
    onAddClick,
}: CollapsibleSectionProps) {
    return (
        <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
            <SidebarGroup>
                <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent/30 rounded-md transition-colors">
                        <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        className={isMenuCollapsed ? 'gap-0' : ''}
                                    >
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                'hover:bg-sidebar-accent/50',
                                                pathname === item.url &&
                                                    'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                                            )}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={`Add ${label.replace('My ', '')}`}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-muted-foreground hover:text-foreground"
                                        onClick={onAddClick}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span className="text-xs">Add new</span>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    )
}
