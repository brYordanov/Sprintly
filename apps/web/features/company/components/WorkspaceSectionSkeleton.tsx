import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WorkspacesSectionSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-9 w-20 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <WorkspaceRowSkeleton key={i} />
                ))}
            </CardContent>
        </Card>
    )
}

function WorkspaceRowSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    )
}
