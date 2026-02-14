import { CompanyHeader } from '@/features/company/components/CompanyHeader'

export default function CompanyDetailPage() {
    return (
        <div className="p-8 space-y-6">
            <CompanyHeader
                name="Acme Corp"
                description="A leading technology company specializing in innovative software solutions for enterprise clients. We build tools that empower teams to ship faster."
                memberCount={5}
                workspaceCount={3}
                projectCount={4}
            />
        </div>
    )
}
