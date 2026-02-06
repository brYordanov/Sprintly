'use client'

import { useAuth } from '@/contexts/authContext'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ProjectSymbol } from '../ui/icon'

export function AuthenticatedHeader() {
    const { user, logout } = useAuth()

    return (
        <header className="bg-card border-accent pt-4 pb-4 pl-4 pr-4 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
                <ProjectSymbol width={60} height={60} />
                <h1>Sprintly</h1>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 outline-0">
                        <Avatar size="lg">
                            <AvatarImage src={user?.avatarUrl || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
