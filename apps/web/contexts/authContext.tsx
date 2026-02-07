import { UserPublicDto } from '@shared/validations'
import { createContext, useContext, useState } from 'react'

interface AuthContextType {
    user: UserPublicDto | null
    login: (user: UserPublicDto) => void
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({
    children,
    initialUser,
}: {
    children: React.ReactNode
    initialUser: UserPublicDto | null
}) => {
    const [user, setUser] = useState<UserPublicDto | null>(initialUser)

    const login = async (user: UserPublicDto) => {
        setUser(user)
    }

    const logout = async () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
