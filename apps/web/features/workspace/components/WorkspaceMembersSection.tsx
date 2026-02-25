'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/helpers'
import { WorkspaceMember } from '@shared/validations'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { InviteWorkspaceMemberDialog } from './InviteWorkspaceMemberDialog'

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
                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Member
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
                                    <WorkspaceMemberRow key={member.id} member={member} />
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

function WorkspaceMemberRow({ member }: { member: WorkspaceMember }) {
    const effectivePermission = member.workspacePermissionName ?? member.companyPermissionName
    const isInherited = !member.workspacePermissionName && !!member.companyPermissionName

    return (
        <tr>
            <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                        {member.avatarUrl && (
                            <AvatarImage src={member.avatarUrl} alt={member.fullname ?? 'avatar'} />
                        )}
                        <AvatarFallback className="text-xs">
                            {getInitials(member.fullname)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.fullname}</span>
                </div>
            </td>
            <td className="py-3 pr-4">
                <span className="text-sm text-muted-foreground">{member.email}</span>
            </td>
            <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                    {effectivePermission && (
                        <span className="text-sm capitalize">{effectivePermission}</span>
                    )}
                    {isInherited && (
                        <Badge variant="outline" className="text-xs">
                            Inherited
                        </Badge>
                    )}
                </div>
            </td>
        </tr>
    )
}
