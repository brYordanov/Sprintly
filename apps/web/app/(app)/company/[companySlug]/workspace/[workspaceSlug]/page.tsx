import { WorkspaceDetailsView } from '@/features/workspace/components/WorkspaceDetailsView'

export default async function WorkspaceDetailsPage({
    params,
}: {
    params: Promise<{ companySlug: string; workspaceSlug: string }>
}) {
    const { companySlug, workspaceSlug } = await params
    return (
        <div className="p-8 space-y-6">
            <WorkspaceDetailsView workspaceSlug={workspaceSlug} companySlug={companySlug} />
        </div>
    )
}
