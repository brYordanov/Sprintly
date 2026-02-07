import { HeaderWrapper } from '@/components/layout/headerWrapper'
import { getCurrentUser } from '@/lib/auth'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Sprintly',
    description: 'mini Jira',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const user = await getCurrentUser()

    return (
        <html lang="en">
            <body
                className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-background`}
            >
                <Providers initialUser={user}>
                    <HeaderWrapper />
                    {children}
                </Providers>
            </body>
        </html>
    )
}
