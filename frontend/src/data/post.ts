import { apiRequest } from '../lib/api-request';

async function fetchFeedPosts() {
    try {
        const data = await apiRequest<{ posts: any[] }>('/posts');
        return data.posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

export { fetchFeedPosts };