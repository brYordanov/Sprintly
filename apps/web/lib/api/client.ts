import { API_BASE_URL } from './constants'

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any,
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
    if (refreshPromise) {
        return refreshPromise
    }

    refreshPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            })

            if (!response.ok) {
                throw new ApiError('Refresh Failed', response.status)
            }
        } catch (err) {
            window.location.href = '/login'
            throw err
        } finally {
            refreshPromise = null
        }
    })()
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
    }

    let response = await fetch(url, config)
    if (response.status === 401 && !endpoint.includes('auth')) {
        await refreshAccessToken()

        response = await fetch(url, config)
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new ApiError(err.message || 'An error occured', response.status, err)
    }

    if (response.status === 204) return undefined as T

    return response.json()
}
