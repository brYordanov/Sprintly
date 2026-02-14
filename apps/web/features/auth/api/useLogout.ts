import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useLogout() {
    const { logout } = useAuth()
    const router = useRouter()

    return useMutation({
        mutationFn: () =>
            apiClient('auth/logout', {
                method: 'POST',
            }),
        onSuccess: () => {
            toast.success('Successfuly logged out')
            logout()
            router.replace('/')
        },
        onError: err => {
            console.error(`Log out failed: ${err}`)
            toast.error('Log out failed')
        },
    })
}
