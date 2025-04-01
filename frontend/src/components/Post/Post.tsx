import React, { JSX, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DotsIcon } from '../../ui/Icon/3dots';
import { apiRequest } from '../../lib/api-request';
import { LikeIcon } from '../../ui/NavBarIcon/like';
import { LikeSIcon } from '../../ui/NavBarIcon/likeS';
import { post } from 'axios';

interface PostProps {
    id: number;
    username: string;
    content: string;
    created_at: { date: string; timezone_type: number; timezone: string };
    avatar: string | null;
    user_id: number;
    isBlocked: boolean;
    onDelete: (postId: number) => void;
    userLiked: boolean; // Indique si l'utilisateur connecté a liké ce post
    media: string | null; // URL du média associé au post
}

const Post = ({ id, username, content, created_at, avatar, user_id, isBlocked, onDelete, userLiked, media }: PostProps): JSX.Element => {
    const [showPopup, setShowPopup] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [liked, setLiked] = useState(userLiked); // État pour savoir si l'utilisateur a liké
    const [likeCount, setLikeCount] = useState<number>(0); // Compteur de likes

    const connectedUserId = Number(localStorage.getItem('user_id')); // ID de l'utilisateur connecté

    // Récupérer le nombre de likes au chargement du composant
    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await apiRequest(`/post/like/${id}`, { method: 'GET' });
                const data = await response.json();
                setLikeCount(data.likes || 0); // Initialiser le compteur de likes
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };

        if (!isBlocked) {
            fetchLikes(); // Ne récupère les likes que si l'utilisateur n'est pas bloqué
        }
    }, [id, isBlocked]);

    // Gérer le like/unlike
    const handleLike = async () => {
        if (isBlocked) return; // Empêche l'interaction si l'utilisateur est bloqué

        try {
            const response = await apiRequest(`/post/like/${id}`, {
                method: liked ? 'DELETE' : 'POST',
                body: JSON.stringify({ user_id: connectedUserId }),
            });

            if (response.ok) {
                setLiked(!liked); // Inverser l'état du like
                setLikeCount(prev => (liked ? prev - 1 : prev + 1)); // Mettre à jour le compteur
            } else {
                console.error('Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Gérer la suppression d'un post
    const handleDelete = async () => {
        try {
            const response = await apiRequest(`/posts/${id}`, { method: 'DELETE' });
            if (response.ok) {
                onDelete(id); // Supprime le post de la liste
            } else {
                console.error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setShowConfirm(false);
        }
    };

    return (
        <div className="flex flex-row w-full bg-custom">
            <Link to={`/profile/${username}`} className="flex-shrink-0">
                <img
                    src={avatar || '../../../public/default-avata.webp'}
                    className="rounded-full max-w-8 max-h-8 mt-4 ml-2 aspect-square"
                    alt="User avatar"
                />
            </Link>
            <div className="p-4 border-b border-custom-gray w-full relative">
                <div className="flex items-center justify-between mb-2">
                    <Link to={`/profile/${username}`} className="font-bold mr-2 text-custom hover:underline">
                        {username}
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-custom-light-gray text-sm">{new Date(created_at.date).toLocaleString()}</span>
                        <div className="relative">
                            <DotsIcon
                                className="w-4 h-4 cursor-pointer"
                                alt="3 dots"
                                onClick={() => setShowPopup(!showPopup)}
                            />
                            {showPopup && (
                                <div className="absolute top-8 right-0 bg-white shadow-md rounded-md p-2 z-10">
                                    {connectedUserId === user_id ? (
                                        <>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                onClick={() => setShowConfirm(true)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Report
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`text-gray-800 break-words max-w-65  ${isBlocked ? 'text-custom-red' : 'text-custom-light-gray'}` }>
                    {content}
                </div>
                {media && (
                <div className="mt-4">
                    {media.endsWith('.jpg') || media.endsWith('.png') || media.endsWith('.jpeg') ? (
                        <img src={media} alt="Post media" className="max-w-full h-auto rounded-md" />
                    ) : (
                        <video controls className="max-w-full h-auto rounded-md">
                            <source src={media} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
                )}
                {!isBlocked && ( // N'affiche les likes que si l'utilisateur n'est pas bloqué
                    <div className="mt-4 flex items-center text-custom">
                        <button onClick={handleLike} className="flex items-center gap-1 cursor-pointer">
                            {liked ? (
                                <LikeSIcon className="w-6 h-6 text-red-500" alt="Liked" />
                            ) : (
                                <LikeIcon className="w-5 h-5 text-gray-500" alt="Like" />
                            )}
                            <span className="text-sm text-gray-700">{likeCount}</span>
                        </button>
                    </div>
                )}
            </div>
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-20 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <p className="mb-4 text-custom-inverse">Are you sure you want to delete this post?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-custom-inverse"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Post;