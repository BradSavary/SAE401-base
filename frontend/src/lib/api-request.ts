const API_BASE_URL = 'http://localhost:8080';

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

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        return response;
    } catch (error) {
        throw new Error(`API request failed: ${error}`);
    }
};