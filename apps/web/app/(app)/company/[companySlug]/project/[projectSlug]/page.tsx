import { ProjectDetailsView } from '@/features/project/components/ProjectDetailsView'

export default async function ProjectDetaisPage({
    params,
}: {
    params: Promise<{ projectSlug: string }>
}) {
    const { projectSlug } = await params
    return <ProjectDetailsView></ProjectDetailsView>
}
