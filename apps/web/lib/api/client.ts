import { API_BASE_URL } from './constants'

class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any,
    ) {
        super(message)
        this.name = 'ApiError'
    }
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

    const response = await fetch(url, config)

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new ApiError(err.message || 'An error occured', response.status, err)
    }

    return response.json()
}
