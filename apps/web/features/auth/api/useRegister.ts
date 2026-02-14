import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api/client'
import { RegisterBodyDto, UserPublicDto } from '@shared/validations'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useRegister() {
    const { login } = useAuth()
    const router = useRouter()
    return useMutation({
        mutationFn: (data: RegisterBodyDto) =>
            apiClient<UserPublicDto>('auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: user => {
            toast.success('Successfuly registered', { description: 'Welcome aboard!' })
            login(user)
            router.replace('/dashboard')
        },
        onError: err => {
            console.error(`Registration failed: ${err}`)
            toast.error('Registration failed')
        },
    })
}
