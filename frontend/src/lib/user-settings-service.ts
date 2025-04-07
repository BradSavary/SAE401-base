import { apiRequest } from './api-request';

/**
 * Interface représentant l'état du mode lecture seule d'un utilisateur
 */
interface ReadOnlyStatus {
    is_read_only: boolean;
}

/**
 * Vérifie si un utilisateur a activé le mode lecture seule
 */
export async function checkReadOnlyStatus(userId: number): Promise<boolean> {
    try {
        const response = await apiRequest(`/user/is-readonly/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to check read-only status');
        }
        const data: ReadOnlyStatus = await response.json();
        return data.is_read_only;
    } catch (error) {
        console.error('Error checking read-only status:', error);
        return false;
    }
}

/**
 * Active ou désactive le mode lecture seule pour un utilisateur
 */
export async function toggleReadOnlyMode(userId: number, isReadOnly?: boolean): Promise<boolean> {
    try {
        const payload = isReadOnly !== undefined ? { is_read_only: isReadOnly } : {};
        const response = await apiRequest(`/user/toggle-readonly/${userId}`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
            throw new Error('Failed to toggle read-only mode');
        }
        
        const data = await response.json();
        return data.is_read_only;
    } catch (error) {
        console.error('Error toggling read-only mode:', error);
        throw error;
    }
} 