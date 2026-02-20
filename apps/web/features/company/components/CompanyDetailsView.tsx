'use client'

import { useGetCompanyDetails } from '@/features/company/api/useGetCompanyDetails'
import { CompanyHeader } from './CompanyHeader'
import { CompanyHeaderSkeleton } from './CompanyHeaderSkeleton'

export function CompanyDetailsView({ companySlug }: { companySlug: string }) {
    const { data, isLoading } = useGetCompanyDetails(companySlug)

    if (isLoading || !data) {
        return <CompanyHeaderSkeleton />
    }

    return (
        <CompanyHeader
            companyId={data.company.id}
            name={data.company.name}
            slug={data.company.slug}
            description={data.company.description}
            memberCount={data.stats.memberCount}
            workspaceCount={data.stats.workspaceCount}
            projectCount={data.stats.projectCount}
        />
    )
}
