'use client'
import { useAuth } from '@/contexts/authContext'
import { AuthenticatedHeader } from './authenticatedHeader'
import { Header } from './header'

export function HeaderWrapper() {
    const { user } = useAuth()
    return user ? <AuthenticatedHeader /> : <Header />
}
