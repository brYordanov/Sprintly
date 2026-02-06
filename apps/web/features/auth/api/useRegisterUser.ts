import { useAuth } from '@/contexts/authContext'
import { apiClient } from '@/lib/api/client'
import { RegisterBodyDto, RegisterResponseDto } from '@shared/validations'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useRegister() {
    const { login } = useAuth()
    const router = useRouter()
    return useMutation({
        mutationFn: async (data: RegisterBodyDto) =>
            apiClient<RegisterResponseDto>('auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: data => {
            toast.success('Successfuly registered', { description: 'Welcome aboard!' })
            login(data.accessToken, data.user)
            router.replace('/dashboard')
        },
        onError: err => {
            console.error(`Registration failed: ${err}`)
            toast.error('Registration failed')
        },
    })
}
