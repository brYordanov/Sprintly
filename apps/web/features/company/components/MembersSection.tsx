import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/helpers'
import { CompanyMembers, PERMISSION } from '@shared/validations'

export function MembersSection({ members }: { members: CompanyMembers[] }) {
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
                    onClick={() => console.log(123)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {' '}
                    + Invite
                </Button>
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
                        {members.map(member => (
                            <tr key={member.id}>
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-medium shrink-0">
                                            {getInitials(member.fullname ?? member.username)}
                                        </div>
                                        <span className="text-sm text-foreground">
                                            {member.fullname ?? member.username}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 pr-4">
                                    <span className="text-sm text-muted-foreground">
                                        {member.email}
                                    </span>
                                </td>
                                <td className="py-3 pr-4">
                                    <Select defaultValue={member.permissionName ?? undefined}>
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
