const API_BASE_URL = 'http://localhost:8080';

export const apiRequest = async <T>(endpoint: string, config?: RequestInit): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json() as T;
            return data;
        } else {
            const text = await response.text();
            return text as unknown as T;
        }
    } catch (error) {
        throw new Error(`API request failed: ${error}`);
    }
};

