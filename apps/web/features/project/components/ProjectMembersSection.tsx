'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PERMISSION, ProjectMember } from '@shared/validations'
import { useState } from 'react'
import { InviteProjectMemberDialog } from './InviteProjectMemberDialog'
import { ProjectMemberRow } from './ProjectMemberRow'

interface ProjectMembersSectionProps {
    members: ProjectMember[]
    projectId: string
    projectSlug: string
    currentUserEffectivePermissionLevel: number
}

export function ProjectMembersSection({
    members,
    projectId,
    projectSlug,
    currentUserEffectivePermissionLevel,
}: ProjectMembersSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base">Members</CardTitle>
                        <CardDescription>People with access to this project</CardDescription>
                    </div>
                    {currentUserEffectivePermissionLevel >= PERMISSION.maintainer.level && (
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            + Add Member
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="overflow-y-auto max-h-96">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-sm font-medium text-muted-foreground pb-3 w-1/3">
                                        Member
                                    </th>
                                    <th className="text-left text-sm font-medium text-muted-foreground pb-3 w-1/3">
                                        Email
                                    </th>
                                    <th className="text-left text-sm font-medium text-muted-foreground pb-3">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {members.map(member => (
                                    <ProjectMemberRow
                                        key={member.id}
                                        member={member}
                                        projectId={projectId}
                                        projectSlug={projectSlug}
                                        currentUserEffectivePermissionLevel={
                                            currentUserEffectivePermissionLevel
                                        }
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <InviteProjectMemberDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                projectId={projectId}
                projectSlug={projectSlug}
            />
        </>
    )
}
