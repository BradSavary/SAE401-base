import { apiRequest } from "../src/lib/api-request";

interface User {
    user_id: number;
    username: string;
    email: string;
    avatar: string | null;
    place: string | null;
    banner: string | null;
    link: string | null;
    bio: string | null;
}

export const getUserProfile = async (userId?: string): Promise<User> => {
    const endpoint = userId ? `/user/${userId}` : '/user/';
    const response = await apiRequest<User>(endpoint);
    return response.json();
};