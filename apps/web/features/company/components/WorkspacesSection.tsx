import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkspaceSummary } from '@shared/validations'
import { ExternalLink, Layers } from 'lucide-react'
import Link from 'next/link'

interface WorkspacesSectionProps {
    workspaces: WorkspaceSummary[]
    companySlug: string
}

export function WorkspacesSection({ workspaces, companySlug }: WorkspacesSectionProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle>Workspaces</CardTitle>
                    <CardDescription>Organized team spaces</CardDescription>
                </div>
                <Button variant="outline" onClick={() => {}}>
                    + New
                </Button>
            </CardHeader>
            <CardContent className="space-y-1">
                {workspaces.map(workspace => (
                    <Link
                        key={workspace.id}
                        href={`/company/${companySlug}/workspace/${workspace.slug}`}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 shrink-0">
                            <Layers className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{workspace.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {workspace.projectCount} projects · {workspace.memberCount} members
                            </p>
                        </div>
                        <ExternalLink className="h-4 w-4  opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}
