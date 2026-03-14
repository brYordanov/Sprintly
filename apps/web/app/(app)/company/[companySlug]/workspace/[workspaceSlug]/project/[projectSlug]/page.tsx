import { PageContainer } from '@/components/layout/PageContainer'
import { ProjectDetailsView } from '@/features/project/components/ProjectDetailsView'

export default async function ProjectDetaisPage({
    params,
}: {
    params: Promise<{ projectSlug: string }>
}) {
    const { projectSlug } = await params

    return (
        <PageContainer>
            <ProjectDetailsView projectSlug={projectSlug} />
        </PageContainer>
    )
}
