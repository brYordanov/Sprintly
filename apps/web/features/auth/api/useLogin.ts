import { useAuth } from '@/contexts/authContext'
import { apiClient } from '@/lib/api/client'
import { LoginBodyDto, UserPublicDto } from '@shared/validations'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useLogin() {
    const { login } = useAuth()
    const router = useRouter()

    return useMutation({
        mutationFn: async (data: LoginBodyDto) =>
            apiClient<UserPublicDto>('auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: user => {
            login(user)
            router.replace('/dashboard')
        },
        onError: err => {
            console.error(`Login failed: ${err}`)
            toast.error('Login failed')
        },
    })
}
