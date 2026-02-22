import { Button } from '@/components/ui/button'
import { CompanyMember } from '@shared/validations'
import { useState } from 'react'
import { InviteMemberDialog } from './InviteMemberDialog'
import { MemberRow } from './MemberRow'

interface MembersSectionProps {
    members: CompanyMember[]
    companyId: string
    companySlug: string
}

export function MembersSection({ members, companyId, companySlug }: MembersSectionProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)

    return (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-base font-semibold text-foreground">Members</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage team members and their permissions
                    </p>
                </div>
                <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {' '}
                    + Invite
                </Button>
                <InviteMemberDialog
                    isOpen={isInviteOpen}
                    onOpenChange={setIsInviteOpen}
                    companyId={companyId}
                    companySlug={companySlug}
                />
            </div>
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
                            <MemberRow
                                key={m.id}
                                member={m}
                                companyId={companyId}
                                companySlug={companySlug}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
