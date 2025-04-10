const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiRequest = async <T>(endpoint: string, config?: RequestInit): Promise<Response> => {
    try {
        const token = localStorage.getItem('accessToken');
        const options = {
            ...config,
            headers: {
                ...config?.headers,
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        };

        // S'assurer que l'endpoint commence par un slash
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

        const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, options);
        return response;
    } catch (error) {
        throw new Error(`API request failed: ${error}`);
    }
};