import { CompanyDetailsView } from '@/features/company/components/CompanyDetailsView'

export default async function CompanyDetailPage({
    params,
}: {
    params: Promise<{ companySlug: string }>
}) {
    const { companySlug } = await params

    return (
        <div className="p-8 space-y-6">
            <CompanyDetailsView companySlug={companySlug} />
        </div>
    )
}
