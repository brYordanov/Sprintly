import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/helpers'
import { CompanyMember, PERMISSION } from '@shared/validations'
import { useState } from 'react'
import { InviteMemberDialog } from './InviteMemberDialog'

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
                            <tr key={m.id}>
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-20 w-20" size="lg">
                                            {m.avatarUrl && (
                                                <AvatarImage
                                                    src={m.avatarUrl}
                                                    alt={m.username}
                                                    className="object-cover"
                                                />
                                            )}
                                            <AvatarFallback className="bg-blue-600 text-white font-semibold">
                                                {getInitials(m.fullname ?? m.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-foreground">
                                            {m.fullname ?? m.username}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 pr-4">
                                    <span className="text-sm text-muted-foreground">{m.email}</span>
                                </td>
                                <td className="py-3 pr-4">
                                    <Select defaultValue={m.permissionName ?? undefined}>
                                        <SelectTrigger className="w-36 h-8 text-sm cursor-pointer">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(PERMISSION).map(([name]) => (
                                                <SelectItem
                                                    key={name}
                                                    value={name}
                                                    className="text-sm"
                                                >
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="py-3 text-right">
                                    <button
                                        onClick={() => {}}
                                        className="text-sm text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
