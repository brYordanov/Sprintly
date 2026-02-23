'use client'

import { InsufficientPermissionDialog } from '@/components/dialogs/InsufficientPermissionDialog'
import { useGetCompanyDetails } from '@/features/company/api/useGetCompanyDetails'
import { CompanyHeader } from './CompanyHeader'
import { CompanyHeaderSkeleton } from './CompanyHeaderSkeleton'
import { MembersSection } from './MembersSection'
import { MembersSectionSkeleton } from './MembersSectionSkeleton'
import { ProjectsSectionSkeleton } from './ProjectSectionSkeleton'
import { ProjectsSection } from './ProjectsSection'
import { WorkspacesSectionSkeleton } from './WorkspaceSectionSkeleton'
import { WorkspacesSection } from './WorkspacesSection'

export function CompanyDetailsView({ companySlug }: { companySlug: string }) {
    const { data, isLoading, error } = useGetCompanyDetails(companySlug)

    if (isLoading || !data) {
        return (
            <>
                <CompanyHeaderSkeleton />
                <MembersSectionSkeleton />
                <InsufficientPermissionDialog open={error?.status === 403} />
                <div className="grid grid-cols-2 gap-6">
                    <WorkspacesSectionSkeleton />
                    <ProjectsSectionSkeleton />
                </div>
            </>
        )
    }

    return (
        <>
            <CompanyHeader
                companyId={data.company.id}
                name={data.company.name}
                slug={data.company.slug}
                logoUrl={data.company.logoUrl}
                description={data.company.description}
                memberCount={data.stats.memberCount}
                workspaceCount={data.stats.workspaceCount}
                projectCount={data.stats.projectCount}
            />
            <MembersSection
                members={data.members}
                companyId={data.company.id}
                companySlug={data.company.slug}
            />
            <div className="grid grid-cols-2 gap-6">
                <WorkspacesSection workspaces={data.workspaces} companySlug={data.company.slug} />
                <ProjectsSection projects={data.companyProjects} />
            </div>
        </>
    )
}
