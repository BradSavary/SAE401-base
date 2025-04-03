import { apiRequest } from './api-request';

export interface BlockedUser {
  id: number;
  username: string;
  blocked_at: string;
}

interface BlockStatus {
  is_blocked: boolean;      // L'utilisateur est bloqué par l'utilisateur courant
  is_blocked_by: boolean;   // L'utilisateur courant est bloqué par cet utilisateur
  is_admin_blocked?: boolean; // L'utilisateur est bloqué par l'administration
}

/**
 * Vérifie si un utilisateur est bloqué ou bloque l'utilisateur courant
 */
export async function checkBlockStatus(userId: number): Promise<BlockStatus> {
  try {
    const response = await apiRequest(`/users/is-blocked/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to check block status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking block status:', error);
    return { is_blocked: false, is_blocked_by: false, is_admin_blocked: false };
  }
}

/**
 * Bloque ou débloque un utilisateur
 */
export async function toggleBlockUser(userId: number): Promise<boolean> {
  try {
    const response = await apiRequest(`/users/block/${userId}`, { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to toggle block user');
    }
    const data = await response.json();
    return data.message.includes('unblocked') ? false : true;
  } catch (error) {
    console.error('Error toggling block user:', error);
    throw error;
  }
}

/**
 * Récupère la liste des utilisateurs bloqués
 */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
  try {
    const response = await apiRequest('/users/blocks');
    if (!response.ok) {
      throw new Error('Failed to get blocked users');
    }
    const data = await response.json();
    return data.blocked_users || [];
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
}

/**
 * Enrichit les données de post avec les informations de blocage
 * @param posts Liste de posts à enrichir
 * @returns Posts enrichis avec les informations de blocage
 */
export async function enrichPostsWithBlockingInfo<T extends { author: { user_id: number }, isBlocked?: boolean, isUserBlockedOrBlocking?: boolean }>(
  posts: T[]
): Promise<T[]> {
  try {
    if (posts.length === 0) {
      return posts;
    }
    
    const uniqueAuthors = [...new Set(posts.map(post => post.author.user_id))];
    
    const blockStatusMap = new Map<number, BlockStatus>();
    
    await Promise.all(
      uniqueAuthors.map(async (authorId) => {
        try {
          const status = await checkBlockStatus(authorId);
          blockStatusMap.set(authorId, status);
        } catch (error) {
          console.error(`Error checking block status for user ${authorId}:`, error);
          blockStatusMap.set(authorId, { is_blocked: false, is_blocked_by: false, is_admin_blocked: false });
        }
      })
    );
    
    return posts.map(post => ({
      ...post,
      isBlocked: blockStatusMap.get(post.author.user_id)?.is_admin_blocked || false,
      isUserBlockedOrBlocking: 
        blockStatusMap.get(post.author.user_id)?.is_blocked || 
        blockStatusMap.get(post.author.user_id)?.is_blocked_by || 
        false
    }));
  } catch (error) {
    console.error('Error enriching posts with blocking info:', error);
    return posts;
  }
} 