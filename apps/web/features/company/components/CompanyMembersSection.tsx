import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyMember } from '@shared/validations'
import { useState } from 'react'
import { CompanyMemberRow } from './CompanyMemberRow'
import { InviteMemberDialog } from './InviteMemberDialog'

interface MembersSectionProps {
    members: CompanyMember[]
    companyId: string
    companySlug: string
}

export function CompanyMembersSection({ members, companyId, companySlug }: MembersSectionProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-base">Members</CardTitle>
                    <CardDescription>Manage team members and their permissions</CardDescription>
                </div>
                <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    + Invite
                </Button>
                <InviteMemberDialog
                    isOpen={isInviteOpen}
                    onOpenChange={setIsInviteOpen}
                    companyId={companyId}
                    companySlug={companySlug}
                />
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
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {members.map(m => (
                                <CompanyMemberRow
                                    key={m.id}
                                    member={m}
                                    companyId={companyId}
                                    companySlug={companySlug}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
