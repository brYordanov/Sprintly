import { WorkspaceDetailsView } from '@/features/workspace/components/WorkspaceDetailsView'

export default async function WorkspaceDetailsPage({
    params,
}: {
    params: Promise<{ workspaceSlug: string }>
}) {
    const { workspaceSlug } = await params
    return (
        <div className="p-8 space-y-6">
            <WorkspaceDetailsView workspaceSlug={workspaceSlug} />
        </div>
    )
}
