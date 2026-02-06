import { UserPublicDto } from '@shared/validations'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AuthContextType {
    user: UserPublicDto | null
    accessToken: string | null
    login: (accessToken: string, user: UserPublicDto) => void
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserPublicDto | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const userData = localStorage.getItem('user')

        if (token && userData) {
            // eslint-disable-next-line
            setAccessToken(token)
            setUser(JSON.parse(userData))
        }
    }, [])

    const login = (accessToken: string, user: UserPublicDto) => {
        try {
            setUser(user)
            setAccessToken(accessToken)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('accessToken', accessToken)
        } catch (err) {
            console.error(`Err while saving auth data: ${err}`)
            toast.error('Failed to save session')
        }
    }

    const logout = () => {
        try {
            setUser(null)
            setAccessToken(null)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
        } catch (err) {
            console.error(`Err while deleting auth data: ${err}`)
            toast.error('Failed to delete session')
        }
    }

    return (
        <AuthContext.Provider
            value={{ user, accessToken, login, logout, isAuthenticated: !!accessToken }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
