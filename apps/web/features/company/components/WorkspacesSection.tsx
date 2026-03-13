'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateWorkspaceDialog } from '@/features/workspace/components/CreateWorkspaceDialog'
import { PERMISSION, WorkspaceSummary } from '@shared/validations'
import { ExternalLink, Layers } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface WorkspacesSectionProps {
    workspaces: WorkspaceSummary[]
    companySlug: string
    companyId: string
    companyName: string
    currentUserEffectivePermissionLevel: number
}

export function WorkspacesSection({
    workspaces,
    companySlug,
    companyId,
    companyName,
    currentUserEffectivePermissionLevel,
}: WorkspacesSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base">Workspaces</CardTitle>
                        <CardDescription>Organized team spaces</CardDescription>
                    </div>
                    {currentUserEffectivePermissionLevel >= PERMISSION.maintainer.level && (
                        <Button variant="outline" onClick={() => setDialogOpen(true)}>
                            + New
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-1">
                    {workspaces.map(workspace => (
                        <Link
                            key={workspace.id}
                            href={`/company/${companySlug}/workspace/${workspace.slug}`}
                            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 shrink-0">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                    {workspace.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {workspace.projectCount} {` `}
                                    {Number(workspace.projectCount) === 1
                                        ? 'project'
                                        : 'projects'}{' '}
                                    · {workspace.memberCount}{' '}
                                    {Number(workspace.memberCount) === 1
                                        ? 'member'
                                        : 'members'}{' '}
                                </p>
                            </div>
                            <ExternalLink className="h-4 w-4  opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <CreateWorkspaceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                companyId={companyId}
                companyName={companyName}
                companySlug={companySlug}
            />
        </>
    )
}
