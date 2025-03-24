import { apiRequest } from '../lib/api-request';

async function fetchFeedPosts() {
    try {
        const response = await apiRequest<{ posts: any[] }>('/posts');
        const data = await response.json();
        return data.posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

export { fetchFeedPosts };