import { UserPublicDto, UserPublicSchema } from '@shared/validations'
import { cookies } from 'next/headers'
import { apiClient } from './api/client'

export async function getCurrentUser(): Promise<UserPublicDto | null> {
    try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get('accessToken')

        if (!accessToken) return null

        const data = await apiClient<UserPublicDto>('auth/me', {
            headers: {
                Cookie: `accessToken=${accessToken.value}`,
            },
            cache: 'no-store',
        })

        return UserPublicSchema.parse(data)
    } catch (err) {
        console.error('Error fetching current user:', err)
        return null
    }
}
