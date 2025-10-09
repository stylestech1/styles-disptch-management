export interface ApiResponse<T>{
    data?: T
    paginationResult?: {
        currentPage?: number
        limit?: number
        totalPages?: number
    }
    message?: string
    errors?: {msg?: string}[]
}

export const apiClient = async <T>(url: string, token: string, options: RequestInit = {}) : Promise<ApiResponse<T>> => {
    const res = await fetch(url, {
        ...options, // adding Methods
        headers: {
            'Content-Type' : 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...options.headers
        }
    })

    const result = (await res.json().catch(() => ({}))) as ApiResponse<T>

    if(!res.ok){
        const message = result.message || result.errors?.map(e => e.msg).join(', ') || 'Request Failed'
        throw new Error(message)
    }

    return result
}