import { apiRequest } from './api-request';
import { checkReadOnlyStatus } from './user-settings-service';

interface PostData {
    id: number;
    username: string;
    content: string;
    created_at: { date: string; timezone_type: number; timezone: string };
    avatar: string;
    user_id: number;
    isBlocked?: boolean;
    isUserBlockedOrBlocking?: boolean;
    userLiked?: boolean;
    media: any[];
    comments?: any[];
    is_censored: boolean;
    is_read_only?: boolean;
}

/**
 * Récupère un post par son ID et l'enrichit avec des informations supplémentaires
 */
export async function getPostWithDetails(postId: number): Promise<PostData | null> {
    try {
        const response = await apiRequest(`/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const post = await response.json();
        
        // Enrichir avec le statut de lecture seule
        try {
            const isReadOnly = await checkReadOnlyStatus(post.user_id);
            post.is_read_only = isReadOnly;
        } catch (error) {
            console.error('Error fetching read-only status:', error);
            post.is_read_only = false;
        }
        
        return post;
    } catch (error) {
        console.error('Error fetching post details:', error);
        return null;
    }
}

/**
 * Enrichit une collection de posts avec le statut de lecture seule
 */
export async function enrichPostsWithReadOnlyInfo<T extends { user_id: number }>(posts: T[]): Promise<T[]> {
    try {
        if (posts.length === 0) {
            return posts;
        }
        
        const uniqueUserIds = [...new Set(posts.map(post => post.user_id))];
        
        const readOnlyStatusMap = new Map<number, boolean>();
        
        await Promise.all(
            uniqueUserIds.map(async (userId) => {
                try {
                    const isReadOnly = await checkReadOnlyStatus(userId);
                    readOnlyStatusMap.set(userId, isReadOnly);
                } catch (error) {
                    console.error(`Error checking read-only status for user ${userId}:`, error);
                    readOnlyStatusMap.set(userId, false);
                }
            })
        );
        
        return posts.map(post => ({
            ...post,
            is_read_only: readOnlyStatusMap.get(post.user_id) || false
        }));
    } catch (error) {
        console.error('Error enriching posts with read-only info:', error);
        return posts;
    }
} 