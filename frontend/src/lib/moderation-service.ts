import { apiRequest } from './api-request';

/**
 * Service pour gérer les fonctionnalités de modération
 */
export class ModerationService {
  /**
   * Récupère une liste de posts selon les critères de recherche
   * @param query Termes de recherche
   * @returns Liste des posts correspondants
   */
  static async searchPosts(query: string) {
    try {
      const response = await apiRequest(`/moderation/posts?search=${encodeURIComponent(query)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des posts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  /**
   * Récupère une liste de commentaires selon les critères de recherche
   * @param query Termes de recherche
   * @returns Liste des commentaires correspondants
   */
  static async searchComments(query: string) {
    try {
      const response = await apiRequest(`/moderation/comments?search=${encodeURIComponent(query)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des commentaires');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching comments:', error);
      throw error;
    }
  }

  /**
   * Change l'état de censure d'un post
   * @param postId Identifiant du post
   * @param isCensored État de censure à appliquer
   * @returns Réponse de l'API
   */
  static async censorPost(postId: number, isCensored: boolean) {
    try {
      const response = await apiRequest(`/moderation/posts/${postId}/censor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_censored: isCensored }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la censure du post');
      }

      return await response.json();
    } catch (error) {
      console.error('Error censoring post:', error);
      throw error;
    }
  }

  /**
   * Change l'état de censure d'un commentaire
   * @param commentId Identifiant du commentaire
   * @param isCensored État de censure à appliquer
   * @returns Réponse de l'API
   */
  static async censorComment(commentId: number, isCensored: boolean) {
    try {
      const response = await apiRequest(`/moderation/comments/${commentId}/censor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_censored: isCensored }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la censure du commentaire');
      }

      return await response.json();
    } catch (error) {
      console.error('Error censoring comment:', error);
      throw error;
    }
  }
}

export default ModerationService; 