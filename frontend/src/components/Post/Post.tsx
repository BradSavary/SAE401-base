import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DotsIcon } from '../../ui/Icon/3dots';
import { apiRequest } from '../../lib/api-request';
import EditPostModal from './EditPostModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CommentList from "../Comment/CommentList";
import CommentForm from "../Comment/CommentForm";
import { useAuth } from '../../context/AuthProvider';
import Avatar from '../../ui/Profile/Avatar';
import Heart from '../../ui/Post/Heart';
import { StarIcon } from '../../ui/Icon/star';
import { RetweetIcon } from '../../ui/NavBarIcon/retweet';

interface MediaItem {
    url: string;
    type: string;
    id?: number; // ID du média (utile pour la suppression)
}

interface CommentUserInfo {
    id: number;
    username: string;
    avatar: string | null;
    is_blocked: boolean;
}

interface CommentData {
    id: number;
    content: string;
    created_at: { date: string; timezone_type: number; timezone: string };
    user: CommentUserInfo;
    post_id: number;
    is_censored: boolean;
}

interface HashtagData {
    id: number;
    name: string;
}

interface MentionData {
    id: number;
    user_id: number;
    username: string;
}

interface PostData {
    id: number;
    username: string;
    content: string;
    formatted_content?: string; // Contenu formaté avec les hashtags et mentions en HTML
    created_at: { date: string; timezone_type: number; timezone: string };
    avatar: string;
    user_id: number;
    isBlocked?: boolean;  // Utilisateur bloqué par l'administration
    isUserBlockedOrBlocking?: boolean;  // Utilisateur bloqué par l'utilisateur ou qui a bloqué l'utilisateur
    userLiked?: boolean;
    user_retweeted?: boolean; // Ajout pour savoir si l'utilisateur a retweeté ce post
    retweet_count?: number; // Nombre de retweets
    media: MediaItem[];
    comments?: CommentData[];
    is_censored: boolean;
    is_read_only?: boolean; // Indication si l'utilisateur est en mode lecture seule
    hashtags?: HashtagData[]; // Hashtags associés au post
    mentions?: MentionData[]; // Mentions d'utilisateurs dans le post
    is_pinned?: boolean;
    retweeted_by?: { // Informations sur l'utilisateur qui a retweeté
        user_id: number;
        username: string;
        retweeted_at: { date: string; timezone_type: number; timezone: string };
    };
}

interface PostProps {
    post: PostData;
    onDelete: (postId: number) => void;
}

function Post({ post, onDelete }: PostProps) {
    // Guard clause
    if (!post) {
        return null;
    }
    
    const [showPopup, setShowPopup] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [liked, setLiked] = useState(Boolean(post?.userLiked));
    const [likeCount, setLikeCount] = useState<number>(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [comments, setComments] = useState<CommentData[]>(post?.comments || []);
    const [commentsLoaded, setCommentsLoaded] = useState(Boolean(post?.comments && post.comments.length > 0));
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post?.comments?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [isPinned, setIsPinned] = useState(Boolean(post?.is_pinned));
    const [userRetweeted, setUserRetweeted] = useState<boolean>(post.user_retweeted || false);
    const [retweetCount, setRetweetCount] = useState<number>(post.retweet_count || 0);

    const connectedUserId = Number(localStorage.getItem('user_id'));
    const { user } = useAuth();
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isOwner = connectedUserId === post.user_id;

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await apiRequest(`/post/like/${post.id}`, { method: 'GET' });
                const data = await response.json();
                setLikeCount(data.likes || 0);
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };

        if (!post.isBlocked) {
            fetchLikes();
        }
    }, [post.id, post.isBlocked]);

    const fetchComments = async () => {
        if (commentsLoaded || commentsLoading || post.isBlocked) return;
        
        setCommentsLoading(true);
        try {
            const response = await apiRequest(`/posts/${post.id}/comments`, { method: 'GET' });
            
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
                setCommentsCount(data.comments?.length || 0);
                setCommentsLoaded(true);
            } else {
                console.error('Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const toggleComments = async () => {
        if (!commentsLoaded) {
            await fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleLike = async () => {
        if (post.isBlocked) return;

        try {
            const response = await apiRequest(`/post/like/${post.id}`, {
                method: liked ? 'DELETE' : 'POST',
                body: JSON.stringify({ user_id: connectedUserId }),
            });

            if (response.ok) {
                setLiked(!liked);
                setLikeCount(prev => (liked ? prev - 1 : prev + 1));
            } else {
                console.error('Failed to like/unlike post');
            }
        } catch (error) {
            console.error('Error liking/unliking post:', error);
        }
    };

    const handleRetweet = async () => {
        try {
            const method = userRetweeted ? 'DELETE' : 'POST';
            const response = await apiRequest(`/posts/${post.id}/retweet`, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserRetweeted(!userRetweeted);
                setRetweetCount(data.retweet_count);
            } else {
                console.error('Failed to retweet post');
            }
        } catch (error) {
            console.error('Error retweeting post:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await apiRequest(`/posts/${post.id}`, { method: 'DELETE' });
            if (response.ok) {
                onDelete(post.id);
            } else {
                console.error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleConfirmDelete = () => {
        handleDelete();
    };

    const nextMedia = () => {
        if (post.media && post.media.length > 0) {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % post.media.length);
        }
    };

    const prevMedia = () => {
        if (post.media && post.media.length > 0) {
            setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + post.media.length) % post.media.length);
        }
    };

    const renderMedia = (media: MediaItem) => {
        if (media.type.startsWith('image')) {
            return (
                <img
                    src={media.url}
                    alt="Post media"
                    className="max-h-96 w-full object-contain rounded-lg"
                />
            );
        } else if (media.type.startsWith('video')) {
            return (
                <video
                    src={media.url}
                    controls
                    className="max-h-96 w-full object-contain rounded-lg"
                />
            );
        } else if (media.type.startsWith('audio')) {
            return (
                <audio src={media.url} controls className="w-full" />
            );
        }
        return null;
    };

    const handlePostUpdated = () => {
        window.location.reload();
    };

    const handleAddComment = (newComment: any) => {
        setComments([...(comments || []), newComment]);
        setCommentsCount(prev => prev + 1);
        setShowCommentForm(false);
        setCommentsLoaded(true);
        setShowComments(true);
    };

    const handleShowCommentForm = () => {
        // Vérifier si l'utilisateur peut commenter (n'est pas bloqué et n'a pas bloqué l'auteur)
        if (post.isUserBlockedOrBlocking) {
            console.error("Vous ne pouvez pas commenter ce post car l'auteur vous a bloqué ou vous l'avez bloqué");
            return;
        }
        
        // Vérifier si le post est en mode lecture seule
        if (post.is_read_only) {
            console.error("Vous ne pouvez pas commenter ce post car l'auteur a activé le mode lecture seule");
            return;
        }
        
        setShowCommentForm(!showCommentForm);
    };

    const handlePinPost = async () => {
        try {
            const response = await apiRequest(`/posts/${post.id}/pin`, {
                method: 'POST',
            });

            if (response.ok) {
                setIsPinned(!isPinned);
                // Rafraîchir la page pour mettre à jour l'affichage
                window.location.reload();
            } else {
                console.error('Failed to pin/unpin post');
            }
        } catch (error) {
            console.error('Error pinning/unpinning post:', error);
        }
    };

    // Ajouter cette fonction de gestion d'erreur d'image au début de la fonction Post
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = '../../../public/default-avata.webp';
    };

    // Si le contenu indique un blocage par l'administration (text spécifique)
    if (post.content === 'This account has been blocked for violating the terms of use.') {
        return (
            <div className="bg-custom-dark-gray p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3 mb-3">
                    <Link to={`/profile/${post.username}`}>
                        <img
                            src={post.avatar || '../../../public/default-avata.webp'}
                            alt="User avatar"
                            className="rounded-full w-10 h-10 object-cover"
                            onError={handleImageError}
                        />
                    </Link>
                    <div className="flex flex-1 justify-between items-center">
                        <div>
                            <Link to={`/profile/${post.username}`} className="font-bold text-custom-red hover:underline">
                                {post.username}
                            </Link>
                            <p className="text-gray-400 text-sm">
                                {new Date(post.created_at.date).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-custom-red font-italic p-4 bg-red-900/10 rounded">
                    {post.content}
                </div>
            </div>
        );
    }

    // Si l'utilisateur est bloqué par l'administration
    if (post.isBlocked) {
        return (
            <div className="border-b border-custom-gray p-4 text-custom">
                <p className="text-custom-red text-center">
                    This content is unavailable because the user has been blocked by the administration.
                </p>
            </div>
        );
    }

    // Si l'utilisateur est bloqué par l'utilisateur courant ou a bloqué l'utilisateur courant
    if (post.isUserBlockedOrBlocking) {
        return (
            <div className="border-b border-custom-gray p-4 text-custom">
                <p className="text-custom-red text-center">
                    This content is unavailable. The user has been blocked or has blocked you.
                </p>
            </div>
        );
    }

    // Si le contenu a été censuré par l'administration
    if (post.is_censored) {
        return (
            <div className="bg-custom-dark-gray p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3 mb-3">
                    <Link to={`/profile/${post.username}`}>
                        <img
                            src={post.avatar || 'https://gravatar.com/avatar/default?s=200&d=mp&r=pg'}
                            alt="User avatar"
                            className="rounded-full w-10 h-10 object-cover"
                            onError={handleImageError}
                        />
                    </Link>
                    <div className="flex flex-1 justify-between items-center">
                        <div>
                            <Link to={`/profile/${post.username}`} className="font-bold text-white hover:underline">
                                {post.username}
                            </Link>
                            <p className="text-gray-400 text-sm">
                                {new Date(post.created_at.date).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-red-500 font-italic p-4 bg-red-900/10 rounded">
                    Ce message enfreint les conditions d'utilisation de la plateforme
                </div>
            </div>
        );
    }

    return (
        <div className="post-container p-4 border-b border-custom-gray">
            {post.retweeted_by && (
                <div className="flex items-center mb-2 text-custom-light-gray text-xs">
                    <RetweetIcon size="small" className="mr-1" />
                    <Link to={`/profile/${post.retweeted_by.username    }`} className="hover:underline">
                        {post.retweeted_by.username}
                    </Link> &nbsp;a retweeté
                </div>
            )}
            
            <div className="bg-custom-dark-gray p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3 mb-3">
                    <Link to={`/profile/${post.user_id}`}>
                        <img
                            src={post.avatar || 'https://gravatar.com/avatar/default?s=200&d=mp&r=pg'}
                            alt="User avatar"
                            className="rounded-full w-10 h-10 object-cover"
                            onError={handleImageError}
                        />
                    </Link>
                    <div className="flex flex-1 justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <Link to={`/profile/${post.username}`} className={`font-bold ${post.isBlocked || post.isUserBlockedOrBlocking ? 'text-custom-red' : 'text-white'} hover:underline`}>
                                    {post.username}
                                </Link>
                                {isPinned && (
                                    <StarIcon className="w-4 h-4 text-custom-blue" />
                                )}
                            </div>
                            <p className="text-gray-400 text-sm">
                                {new Date(post.created_at.date).toLocaleString()}
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowPopup(!showPopup)}
                                className="text-gray-400 hover:text-white"
                            >
                                <DotsIcon className="w-5 h-5 cursor-pointer" alt="Options" />
                            </button>
                            {showPopup && (
                                <div className="absolute right-0 mt-1 w-48 bg-custom-inverse rounded-md shadow-lg z-10">
                                    {connectedUserId === post.user_id ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowPopup(false);
                                                    setShowEditModal(true);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-custom-blue hover:bg-custom-dark-gray cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowPopup(false);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-custom-red hover:bg-custom-dark-gray cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowPopup(false);
                                                    handlePinPost();
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-custom-blue hover:bg-custom-dark-gray cursor-pointer"
                                            >
                                                {isPinned ? 'Unpin' : 'Pin'}
                                            </button>
                                        </>
                                    ) : (
                                        <button className="block w-full text-left px-4 py-2 text-sm text-custom-red hover:bg-custom-dark-gray cursor-pointer">
                                            Report
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`text-sm whitespace-pre-wrap ${post.isBlocked || post.isUserBlockedOrBlocking ? 'text-custom-red' : 'text-custom-light-gray'}`}>
                    {post.formatted_content ? (
                        <div dangerouslySetInnerHTML={{ __html: post.formatted_content }} />
                    ) : (
                        post.content
                    )}
                </div>
                
                {post.media && post.media.length > 0 && (
                    <div className="mt-4 relative">
                        {renderMedia(post.media[currentMediaIndex])}
                        
                        {post.media.length > 1 && (
                            <div className="flex justify-between absolute top-1/2 transform -translate-y-1/2 w-full">
                                <button 
                                    onClick={prevMedia}
                                    className="bg-black bg-opacity-50 text-white rounded-full p-2 ml-2 hover:bg-opacity-70 cursor-pointer"
                                >
                                    &#8249;
                                </button>
                                <button 
                                    onClick={nextMedia}
                                    className="bg-black bg-opacity-50 text-white rounded-full p-2 mr-2 hover:bg-opacity-70 cursor-pointer"
                                >
                                    &#8250;
                                </button>
                            </div>
                        )}
                        
                        {post.media.length > 1 && (
                            <div className="flex justify-center mt-2">
                                {post.media.map((_, index) => (
                                    <div 
                                        key={index}
                                        className={`w-2 h-2 mx-1 rounded-full ${
                                            index === currentMediaIndex ? 'bg-custom-blue' : 'bg-custom-light-gray'
                                        }`}
                                        onClick={() => setCurrentMediaIndex(index)}
                                    ></div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {!post.isBlocked && (
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-custom-gray">
                        <div className="flex gap-4">
                            <button 
                                className="flex items-center gap-1 text-custom-light-gray text-sm hover:text-white"
                                onClick={toggleComments}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                {commentsCount === 0 && "Commenter"}
                                {commentsCount === 1 && "1 Commentaire"}
                                {commentsCount > 1 && `${commentsCount} Commentaires`}
                                {commentsLoading && " (chargement...)"}
                            </button>
                            <button 
                                onClick={handleRetweet}
                                className="flex items-center text-custom-light-gray hover:text-green-600 focus:outline-none"
                                aria-label={userRetweeted ? "Undo retweet" : "Retweet post"}
                            >
                                <RetweetIcon 
                                    size="small" 
                                    className={userRetweeted ? "text-green-600" : "text-custom-light-gray"}
                                />
                                {retweetCount > 0 && (
                                    <span className={`ml-1 text-xs ${userRetweeted ? "text-green-600" : "text-custom-light-gray"}`}>
                                        {retweetCount}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={handleLike} 
                                className="flex items-center gap-1 text-custom-light-gray text-sm hover:text-white"
                            >
                                <Heart filled={liked} />
                                {likeCount === 0 && "J'aime"}
                                {likeCount === 1 && "1 J'aime"}
                                {likeCount > 1 && `${likeCount} J'aime`}
                            </button>
                        </div>
                    </div>
                )}
                
                {showComments && (
                    <div className="mt-2">
                        {!post.is_read_only ? (
                            <button
                                onClick={handleShowCommentForm}
                                className="text-custom-blue text-sm hover:underline mb-2 flex items-center gap-1 cursor-pointer"
                            >
                                Ajouter un commentaire
                            </button>
                        ) : (
                            <div className="text-custom-light-gray text-sm italic mb-2">
                                Comments are disabled for this post
                            </div>
                        )}
                        
                        {showCommentForm && !post.is_read_only && (
                            <CommentForm 
                                postId={post.id} 
                                onCommentAdded={handleAddComment} 
                                onCancel={() => setShowCommentForm(false)}
                            />
                        )}
                        
                        {commentsLoading ? (
                            <div className="text-center text-custom-light-gray text-sm py-2">
                                Chargement des commentaires...
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="mt-2 pt-2">
                                <CommentList 
                                    comments={comments} 
                                    onDeleteComment={(commentId) => {
                                        setComments(comments.filter(comment => comment.id !== commentId));
                                        setCommentsCount(prev => prev - 1);
                                    }} 
                                    onUpdateComment={(commentId, newContent) => {
                                        setComments(comments.map(comment => 
                                            comment.id === commentId ? { ...comment, content: newContent } : comment
                                        ));
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-custom-light-gray text-sm py-2">
                                Aucun commentaire pour le moment
                            </div>
                        )}
                    </div>
                )}
                
                {showEditModal && (
                    <EditPostModal
                        postId={post.id}
                        initialContent={post.content}
                        existingMedia={post.media}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handlePostUpdated}
                    />
                )}
                
                {showDeleteModal && (
                    <ConfirmDeleteModal
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setShowDeleteModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default Post;