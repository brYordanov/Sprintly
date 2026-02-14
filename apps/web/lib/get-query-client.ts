import { isServer, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function makeQueryClient() {
    return new QueryClient({
        queryCache: new QueryCache({
            onError: (err: any) => {
                if (err?.status >= 500) {
                    toast.error('Something went wrong. Please try again.')
                } else if (err?.status === 403) {
                    toast.error("You don't have permission to do that.")
                }
            },
        }),
        mutationCache: new MutationCache({
            onError: (err: any) => {
                if (err?.status >= 500) {
                    toast.error('Something went wrong. Please try again.')
                } else if (err?.status === 403) {
                    toast.error("You don't have permission to do that.")
                }
            },
        }),
        defaultOptions: {
            queries: {
                retry: 1,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
    if (isServer) {
        return makeQueryClient()
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}
