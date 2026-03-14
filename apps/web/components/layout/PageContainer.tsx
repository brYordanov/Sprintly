import React from 'react'

export function PageContainer({ children }: { children: React.ReactNode }) {
    return <div className="p-8 space-y-6">{children}</div>
}
