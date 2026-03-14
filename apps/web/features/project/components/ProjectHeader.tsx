'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/helpers'
import { PERMISSION } from '@shared/validations'
import { Building2, FolderKanban, Layers, Settings, Users } from 'lucide-react'
import { useState } from 'react'
import { EditProjectDialog } from './EditProjectDialog'

interface ProjectHeaderProps {
    projectId: string
    name: string
    slug: string
    memberCount: number
    currentUserEffectivePermissionLevel: number
    description?: string | null
    iconUrl?: string | null
    workspaceName?: string | null
    companyName?: string
}

export function ProjectHeader({
    projectId,
    name,
    slug,
    memberCount,
    currentUserEffectivePermissionLevel,
    description,
    iconUrl,
    workspaceName,
    companyName,
}: ProjectHeaderProps) {
    const [editOpen, setEditOpen] = useState(false)

    return (
        <>
            <Card>
                <CardContent className="flex items-start justify-between p-6">
                    <div className="flex gap-6">
                        <Avatar className="h-20 w-20 rounded-xl">
                            {iconUrl && (
                                <AvatarImage
                                    src={iconUrl}
                                    alt={name}
                                    className="object-cover rounded-xl"
                                />
                            )}
                            <AvatarFallback className="bg-primary text-white text-2xl font-semibold rounded-xl">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{name}</h1>
                                <div className="flex items-center gap-1 text-sm text-foreground py-1 px-2 rounded-xl bg-border">
                                    <FolderKanban className="h-4 w-4" />
                                    <span>Project</span>
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
                                {workspaceName && (
                                    <div className="flex items-center gap-1.5">
                                        <Layers className="h-4 w-4" />
                                        <span>{workspaceName}</span>
                                    </div>
                                )}
                                {companyName && (
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-4 w-4" />
                                        <span>{companyName}</span>
                                    </div>
                                )}
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

            <EditProjectDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                projectId={projectId}
                slug={slug}
                defaultValues={{ name, slug, description, iconUrl }}
            />
        </>
    )
}
