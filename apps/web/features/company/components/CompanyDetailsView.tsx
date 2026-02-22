'use client'

import { InsufficientPermissionDialog } from '@/components/dialogs/InsufficientPermissionDialog'
import { useGetCompanyDetails } from '@/features/company/api/useGetCompanyDetails'
import { CompanyHeader } from './CompanyHeader'
import { CompanyHeaderSkeleton } from './CompanyHeaderSkeleton'
import { MembersSection } from './MembersSection'
import { MembersSectionSkeleton } from './MembersSectionSkeleton'

export function CompanyDetailsView({ companySlug }: { companySlug: string }) {
    const { data, isLoading, error } = useGetCompanyDetails(companySlug)

    if (isLoading || !data) {
        return (
            <>
                <CompanyHeaderSkeleton />
                <MembersSectionSkeleton />
                <InsufficientPermissionDialog open={error?.status === 403} />
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
        </>
    )
}
