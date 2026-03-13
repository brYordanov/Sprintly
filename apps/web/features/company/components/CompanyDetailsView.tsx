'use client'

import { InsufficientPermissionDialog } from '@/components/dialogs/InsufficientPermissionDialog'
import { DetailsHeaderSkeleton } from '@/components/skeletons/DetailsHeaderSkeleton'
import { MembersSectionSkeleton } from '@/components/skeletons/MembersSectionSkeleton'
import { ProjectsSectionSkeleton } from '@/components/skeletons/ProjectsSectionSkeleton'
import { useGetCompanyDetails } from '@/features/company/api/useGetCompanyDetails'
import { ProjectsSection } from '../../../components/sections/ProjectsSection'
import { CompanyHeader } from './CompanyHeader'
import { CompanyMembersSection } from './CompanyMembersSection'
import { WorkspacesSectionSkeleton } from './WorkspaceSectionSkeleton'
import { WorkspacesSection } from './WorkspacesSection'

export function CompanyDetailsView({ companySlug }: { companySlug: string }) {
    const { data, isLoading, error } = useGetCompanyDetails(companySlug)

    if (isLoading || !data) {
        return (
            <>
                <DetailsHeaderSkeleton />
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
                memberCount={data.members.length}
                workspaceCount={data.workspaces.length}
                projectCount={data.companyProjects.length}
            />
            <CompanyMembersSection
                members={data.members}
                companyId={data.company.id}
                companySlug={data.company.slug}
            />
            <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                <WorkspacesSection
                    workspaces={data.workspaces}
                    companySlug={data.company.slug}
                    companyId={data.company.id}
                    companyName={data.company.name}
                />
                <ProjectsSection
                    projects={data.companyProjects}
                    companyId={data.company.id}
                    companyName={data.company.name}
                    companySlug={data.company.slug}
                />
            </div>
        </>
    )
}
