'use client'

import { InsufficientPermissionDialog } from '@/components/dialogs/InsufficientPermissionDialog'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { DetailsHeaderSkeleton } from '@/components/skeletons/DetailsHeaderSkeleton'
import { MembersSectionSkeleton } from '@/components/skeletons/MembersSectionSkeleton'
import { ProjectsSectionSkeleton } from '@/components/skeletons/ProjectsSectionSkeleton'
import { useGetWorkspaceDetails } from '../api/useGetWorkspaceDetails'
import { WorkspaceHeader } from './WorkspaceHeader'
import { WorkspaceMembersSection } from './WorkspaceMembersSection'

export function WorkspaceDetailsView({ workspaceSlug }: { workspaceSlug: string }) {
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
                memberCount={data.members.length}
                projectCount={data.workspaceProjects.length}
                companyName={data.workspace.company?.name}
                currentUserEffectivePermissionLevel={data.currentUserEffectivePermission}
            />
            <WorkspaceMembersSection
                members={data.members}
                workspaceId={data.workspace.id}
                workspaceSlug={data.workspace.slug}
                currentUserEffectivePermissionLevel={data.currentUserEffectivePermission}
            />
            <div className="md:w-1/2">
                <ProjectsSection
                    projects={data.workspaceProjects}
                    companyId={data.workspace.companyId}
                    companyName={data.workspace.company?.name ?? ''}
                    companySlug={data.workspace.company?.slug ?? ''}
                    currentUserEffectivePermissionLevel={data.currentUserEffectivePermission}
                />
            </div>
        </>
    )
}
