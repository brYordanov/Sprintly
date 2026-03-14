import { PageContainer } from '@/components/layout/PageContainer'
import { CompanyDetailsView } from '@/features/company/components/CompanyDetailsView'

export default async function CompanyDetailPage({
    params,
}: {
    params: Promise<{ companySlug: string }>
}) {
    const { companySlug } = await params

    return (
        <PageContainer>
            <CompanyDetailsView companySlug={companySlug} />
        </PageContainer>
    )
}
