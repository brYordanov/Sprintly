'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkspaceMember } from '@shared/validations'
import { useState } from 'react'
import { InviteWorkspaceMemberDialog } from './InviteWorkspaceMemberDialog'
import { WorkspaceMemberRow } from './WorkspaceMemberRow'

interface WorkspaceMembersSectionProps {
    members: WorkspaceMember[]
    workspaceId: string
    workspaceSlug: string
}

export function WorkspaceMembersSection({
    members,
    workspaceId,
    workspaceSlug,
}: WorkspaceMembersSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base">Members</CardTitle>
                        <CardDescription>People with access to this workspace</CardDescription>
                    </div>
                    <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        + Add Member
                    </Button>
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
                                    <WorkspaceMemberRow
                                        key={member.id}
                                        member={member}
                                        workspaceId={workspaceId}
                                        workspaceSlug={workspaceSlug}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <InviteWorkspaceMemberDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                workspaceId={workspaceId}
                workspaceSlug={workspaceSlug}
            />
        </>
    )
}
