import { Skeleton } from '@/components/ui/skeleton'

export function CompanyHeaderSkeleton() {
    return (
        <div className="flex items-start justify-between p-6 bg-white rounded-lg border">
            <div className="flex gap-6">
                {/* Avatar */}
                <Skeleton className="h-20 w-20 rounded-xl" />

                <div className="flex flex-col gap-3">
                    {/* Name + badge */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-6 w-20 rounded-xl" />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-96" />
                        <Skeleton className="h-4 w-72" />
                    </div>

                    {/* Stats chips */}
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </div>

            {/* Settings button */}
            <Skeleton className="h-9 w-24 rounded-md" />
        </div>
    )
}
