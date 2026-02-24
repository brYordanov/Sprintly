import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectsSectionSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-9 w-20 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ProjectRowSkeleton key={i} />
                ))}
            </CardContent>
        </Card>
    )
}

function ProjectRowSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <Skeleton className="h-4 w-36 flex-1" />
        </div>
    )
}
