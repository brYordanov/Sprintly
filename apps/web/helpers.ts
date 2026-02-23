import { ProjectNavigationSummary } from '@shared/validations'

export const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function getProjectHref(project: ProjectNavigationSummary): string {
    if (project.workspaceSlug) {
        return `/company/${project.companySlug}/workspace/${project.workspaceSlug}/project/${project.slug}`
    }
    return `/company/${project.companySlug}/project/${project.slug}`
}
