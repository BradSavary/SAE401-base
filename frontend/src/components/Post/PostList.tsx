import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiRequest } from '../../lib/api-request';
import Post from './Post';
import { enrichPostsWithBlockingInfo } from '../../lib/block-service';
import { enrichPostsWithReadOnlyInfo } from '../../lib/post-service';
import PostSkeletonList from './PostSkeletonList';

interface MediaItem {
    url: string;
    type: string;
    id?: number;
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
}

interface PostData {
    id: number;
    username: string;
    content: string;
    created_at: { date: string; timezone_type: number; timezone: string };
    avatar: string;
    user_id: number;
    userLiked?: boolean;
    isBlocked?: boolean;
    isUserBlockedOrBlocking?: boolean;
    media: MediaItem[];
    comments?: CommentData[];
    author: {
        user_id: number;
        username: string;
        avatar: string | null;
    };
    is_censored: boolean;
    is_read_only?: boolean;
}

interface PostListProps {
    endpoint?: string;
    className?: string;
    posts?: any[];
}

export default function PostList({ endpoint, className = '', posts: initialPosts }: PostListProps) {
    const [posts, setPosts] = useState<any[]>(initialPosts || []);
    const [loading, setLoading] = useState(!initialPosts);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef<boolean>(false);
    const previousEndpointRef = useRef<string | undefined>(endpoint);

    const fetchPosts = useCallback(async (pageToLoad: number) => {
        if (loadingRef.current || !hasMore || !endpoint) return;
        
        loadingRef.current = true;
        setLoading(true);
        
        try {
            const response = await apiRequest(`${endpoint}?page=${pageToLoad}`);
            const data = await response.json();
            
            if (data.posts && data.posts.length > 0) {
                setPosts(prevPosts => {
                    // Éviter les doublons
                    const newPosts = data.posts.filter((newPost: any) => 
                        !prevPosts.some(prevPost => prevPost.id === newPost.id)
                    );
                    return pageToLoad === 1 ? newPosts : [...prevPosts, ...newPosts];
                });
                setHasMore(data.next_page !== null);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setError('Failed to load posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [endpoint, hasMore]);

    // Réinitialiser et recharger les posts lorsque l'endpoint change
    useEffect(() => {
        if (endpoint && endpoint !== previousEndpointRef.current) {
            setPosts([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            previousEndpointRef.current = endpoint;
            fetchPosts(1);
        }
    }, [endpoint, fetchPosts]);

    // Charger les posts initiaux
    useEffect(() => {
        if (endpoint && !initialPosts && posts.length === 0) {
            fetchPosts(1);
        }
    }, [endpoint, initialPosts, fetchPosts, posts.length]);

    // Gestion du défilement
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (loadingRef.current || !hasMore) return;

            const { scrollTop, scrollHeight, clientHeight } = container;
            // Vérifier si nous sommes proches du bas de la page
            if (scrollHeight - scrollTop <= clientHeight + 100) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchPosts(nextPage);
                    return nextPage;
                });
            }
        };

        // Ajouter l'écouteur immédiatement
        container.addEventListener('scroll', handleScroll);

        // Vérifier la position initiale après le chargement des posts
        if (posts.length > 0) {
            handleScroll();
        }

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, fetchPosts, posts.length]);

    // Ajouter un effet pour vérifier la position du scroll après le chargement initial
    useEffect(() => {
        if (posts.length > 0 && !loading) {
            const container = containerRef.current;
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                if (scrollHeight <= clientHeight) {
                    // Si le contenu est plus petit que la hauteur du conteneur, charger plus de posts
                    setPage(prevPage => {
                        const nextPage = prevPage + 1;
                        fetchPosts(nextPage);
                        return nextPage;
                    });
                }
            }
        }
    }, [posts.length, loading, fetchPosts]);

    const handleDelete = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    if (loading && posts.length === 0) {
        return <PostSkeletonList className="px-4" />;
    }

    if (error) {
        return <div className="text-center text-custom-red">{error}</div>;
    }

    if (posts.length === 0) {
        return <div className="text-center text-custom-light-gray">No posts found</div>;
    }

    const combinedClassName = `overflow-y-auto scrollbar-thin h-full ${className || ''}`;

    return (
        <div ref={containerRef} className={combinedClassName}>
            {posts.map((post) => (
                <Post
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                />
            ))}
            {loading && posts.length > 0 && (
                <PostSkeletonList count={1} className="px-4" />
            )}
        </div>
    );
}