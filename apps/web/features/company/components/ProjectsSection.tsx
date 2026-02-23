import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProjectHref } from '@/helpers'
import { ProjectNavigationSummary } from '@shared/validations'
import { ExternalLink, FolderKanban } from 'lucide-react'
import Link from 'next/link'

export function ProjectsSection({ projects }: { projects: ProjectNavigationSummary[] }) {
    console.log(projects[0])

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-base">Projects</CardTitle>
                    <CardDescription>All company projects</CardDescription>
                </div>
                <Button variant="outline" onClick={() => {}}>
                    + New
                </Button>
            </CardHeader>
            <CardContent className="space-y-1">
                {projects.map(project => (
                    <Link
                        key={project.id}
                        href={getProjectHref(project)}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 shrink-0">
                            <FolderKanban className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {project.name}
                            </p>
                        </div>
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}
