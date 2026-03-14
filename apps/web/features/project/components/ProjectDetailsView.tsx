'use client'

import { InsufficientPermissionDialog } from '@/components/dialogs/InsufficientPermissionDialog'
import { DetailsHeaderSkeleton } from '@/components/skeletons/DetailsHeaderSkeleton'
import { MembersSectionSkeleton } from '@/components/skeletons/MembersSectionSkeleton'
import { useGetProjectDetails } from '../api/useGetProjectDetails'
import { ProjectHeader } from './ProjectHeader'

export function ProjectDetailsView({ projectSlug }: { projectSlug: string }) {
    const { data, isLoading, error } = useGetProjectDetails(projectSlug)

    if (isLoading || !data) {
        return (
            <>
                <DetailsHeaderSkeleton />
                <MembersSectionSkeleton />
                <InsufficientPermissionDialog open={error?.status === 403} />
            </>
        )
    }

    return (
        <>
            <ProjectHeader
                projectId={data.project.id}
                name={data.project.name}
                slug={data.project.slug}
                memberCount={data.members.length}
                currentUserEffectivePermissionLevel={data.currentUserEffectivePermission}
                description={data.project.description}
                iconUrl={data.project.iconUrl}
                workspaceName={data.project.workspace?.name}
                companyName={data.project.company?.name}
            />
        </>
    )
}
