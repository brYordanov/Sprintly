import { PageContainer } from '@/components/layout/PageContainer'
import { WorkspaceDetailsView } from '@/features/workspace/components/WorkspaceDetailsView'

export default async function WorkspaceDetailsPage({
    params,
}: {
    params: Promise<{ workspaceSlug: string }>
}) {
    const { workspaceSlug } = await params
    return (
        <PageContainer>
            <WorkspaceDetailsView workspaceSlug={workspaceSlug} />
        </PageContainer>
    )
}
