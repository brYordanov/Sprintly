'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/helpers'
import { PERMISSION } from '@shared/validations'
import { Building2, FolderKanban, Layers, Settings, Users } from 'lucide-react'
import { useState } from 'react'
import { EditCompanyDialog } from './EditCompanyDialog'

interface CompanyHeaderProps {
    companyId: string
    name: string
    slug: string
    memberCount: number
    workspaceCount: number
    projectCount: number
    description?: string | null
    logoUrl?: string | null
    currentUserEffectivePermissionLevel: number
}

export function CompanyHeader({
    companyId,
    name,
    slug,
    memberCount,
    workspaceCount,
    projectCount,
    description,
    logoUrl,
    currentUserEffectivePermissionLevel,
}: CompanyHeaderProps) {
    const [editOpen, setEditOpen] = useState(false)

    return (
        <>
            <Card>
                <CardContent className="flex items-start justify-between p-6">
                    <div className="flex gap-6">
                        <Avatar className="h-20 w-20 rounded-xl">
                            {logoUrl && (
                                <AvatarImage
                                    src={logoUrl}
                                    alt={name}
                                    className="object-cover rounded-xl"
                                />
                            )}
                            <AvatarFallback className="bg-blue-600 text-white text-2xl font-semibold rounded-xl">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{name}</h1>
                                <div className="flex items-center gap-1 text-sm text-foreground py-1 px-2 rounded-xl bg-border">
                                    <Building2 className="h-4 w-4" />
                                    <span>Company</span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        {memberCount} {memberCount <= 1 ? 'member' : 'members'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Layers className="h-4 w-4" />
                                    <span>
                                        {workspaceCount}{' '}
                                        {workspaceCount <= 1 ? 'workspace' : 'workspaces'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FolderKanban className="h-4 w-4" />
                                    <span>
                                        {projectCount} {projectCount <= 1 ? 'project' : 'projects'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {currentUserEffectivePermissionLevel >= PERMISSION.admin.level && (
                        <Button
                            variant="ghost"
                            className="gap-2 group"
                            onClick={() => setEditOpen(true)}
                        >
                            <Settings className="h-4 w-4 group-hover:text-card transition-all" />
                            Settings
                        </Button>
                    )}
                </CardContent>
            </Card>

            <EditCompanyDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                companyId={companyId}
                slug={slug}
                defaultValues={{ name, slug, description, logoUrl }}
            />
        </>
    )
}
