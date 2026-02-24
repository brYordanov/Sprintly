'use client'

import { InsufficientPermissionDialog } from '@/components/dialogs/InsufficientPermissionDialog'
import { DetailsHeaderSkeleton } from '@/components/skeletons/DetailsHeaderSkeleton'
import { MembersSectionSkeleton } from '@/components/skeletons/MembersSectionSkeleton'
import { ProjectsSectionSkeleton } from '@/components/skeletons/ProjectsSectionSkeleton'
import { ProjectsSection } from '@/features/company/components/ProjectsSection'
import { useGetWorkspaceDetails } from '../api/useGetWorkspaceDetails'
import { WorkspaceHeader } from './WorkspaceHeader'
import { WorkspaceMembersSection } from './WorkspaceMembersSection'

interface WorkspaceDetailsViewProps {
    workspaceSlug: string
    companySlug: string
}

export function WorkspaceDetailsView({ workspaceSlug, companySlug }: WorkspaceDetailsViewProps) {
    const { data, isLoading, error } = useGetWorkspaceDetails(workspaceSlug)

    if (isLoading || !data) {
        return (
            <>
                <DetailsHeaderSkeleton />
                <MembersSectionSkeleton />
                <InsufficientPermissionDialog open={error?.status === 403} />
                <ProjectsSectionSkeleton />
            </>
        )
    }

    return (
        <>
            <WorkspaceHeader
                workspaceId={data.workspace.id}
                name={data.workspace.name}
                slug={data.workspace.slug}
                description={data.workspace.description}
                memberCount={data.stats.memberCount}
                projectCount={data.stats.projectCount}
            />
            <WorkspaceMembersSection members={data.members} />
            <ProjectsSection
                projects={data.workspaceProjects}
                companyId={data.workspace.companyId}
                companyName=""
                companySlug={companySlug}
            />
        </>
    )
}
