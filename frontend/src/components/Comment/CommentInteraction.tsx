import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api-request';
import Heart from '../../ui/Post/Heart';

interface CommentInteractionProps {
    commentId: number;
    initialLikes: number;
    initialDislikes: number;
    userLiked: boolean;
    userDisliked: boolean;
}

export default function CommentInteraction({ commentId, initialLikes, initialDislikes, userLiked, userDisliked }: CommentInteractionProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [isLiked, setIsLiked] = useState(userLiked);
    const [isDisliked, setIsDisliked] = useState(userDisliked);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLikes(initialLikes);
        setDislikes(initialDislikes);
        setIsLiked(userLiked);
        setIsDisliked(userDisliked);
    }, [initialLikes, initialDislikes, userLiked, userDisliked]);

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
                setLikes(data.likes);
                setIsLiked(data.user_liked);
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
                className={`flex items-center gap-1 ${isLiked ? 'text-custom-red' : 'text-custom-light-gray'} hover:text-custom-red transition-colors`}
                aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
            >
                <Heart filled={isLiked} />
                <span className="text-sm">{likes}</span>
            </button>
        </div>
    );
} 