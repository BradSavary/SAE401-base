import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api-request';
import Heart from '../../ui/Post/Heart';

interface CommentInteractionProps {
    commentId: number;
    initialLikes: number;
    initialUserLiked: boolean;
}

export default function CommentInteraction({ commentId, initialLikes, initialUserLiked }: CommentInteractionProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [userLiked, setUserLiked] = useState(initialUserLiked);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await apiRequest(`/comment/${commentId}/interact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message === 'Comment liked successfully') {
                    setLikes(prev => prev + 1);
                    setUserLiked(true);
                } else if (data.message === 'Like removed successfully') {
                    setLikes(prev => prev - 1);
                    setUserLiked(false);
                }
            }
        } catch (error) {
            console.error('Error interacting with comment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={handleLike}
                disabled={isLoading}
                className={`flex items-center gap-1 ${userLiked ? 'text-custom-red' : 'text-custom-light-gray'} hover:text-custom-red transition-colors`}
            >
                <Heart filled={userLiked} />
                <span className="text-sm">{likes}</span>
            </button>
        </div>
    );
} 