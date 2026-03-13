import { Skeleton } from '@/components/ui/skeleton'

export function MembersSectionSkeleton() {
    return (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left pb-3 w-1/3">
                            <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="text-left pb-3 w-1/3">
                            <Skeleton className="h-4 w-12" />
                        </th>
                        <th className="text-left pb-3">
                            <Skeleton className="h-4 w-10" />
                        </th>
                        <th className="w-16" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <MemberRowSkeleton key={i} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function MemberRowSkeleton() {
    return (
        <tr>
            <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </td>
            <td className="py-3 pr-4">
                <Skeleton className="h-4 w-44" />
            </td>
            <td className="py-3 pr-4">
                <Skeleton className="h-8 w-36 rounded-md" />
            </td>
            <td className="py-3 text-right">
                <Skeleton className="h-4 w-14 ml-auto" />
            </td>
        </tr>
    )
}
