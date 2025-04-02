import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../../lib/api-request';
import Post from './Post';

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
    avatar: string;  // Changed from string | null to string to match Post.tsx
    user_id: number;
    userLiked?: boolean;  // Made optional
    isBlocked: boolean;
    media: MediaItem[];
    comments?: CommentData[];
}

interface PostListProps {
    endpoint: string; // API endpoint to fetch posts
    className?: string; // Optional className for styling
}

function PostList({ endpoint, className }: PostListProps) {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1); // Page actuelle
    const [hasMore, setHasMore] = useState<boolean>(true); // Indique s'il reste des posts à charger
    const containerRef = useRef<HTMLDivElement | null>(null); // Référence pour le conteneur défilable

    const fetchPosts = async (pageToLoad: number) => {
        if (loading || !hasMore) return; // Empêche les requêtes multiples ou inutiles
        setLoading(true);
    
        try {
            const response = await apiRequest(`${endpoint}?page=${pageToLoad}`);
            if (response.ok) {
                const data = await response.json();
                const newPosts = data.posts || [];
    
                // Filtrer les posts déjà existants
                setPosts((prevPosts) => {
                    const existingIds = new Set(prevPosts.map((post) => post.id));
                    // Ensure avatar is never null for type compatibility
                    const filteredPosts: PostData[] = newPosts
                        .filter((post: any) => !existingIds.has(post.id))
                        .map((post: any) => ({
                            ...post,
                            avatar: post.avatar || '../../../public/default-avata.webp',
                        }));
                    return [...prevPosts, ...filteredPosts];
                });
    
                setHasMore(newPosts.length > 0); // Vérifie s'il reste des posts à charger
            } else {
                console.error('Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Réinitialiser l'état lorsque l'endpoint change
    useEffect(() => {
        setPosts([]); // Réinitialiser les posts
        setPage(1); // Réinitialiser la page
        setHasMore(true); // Réinitialiser hasMore
        fetchPosts(1); // Charger la première page du nouvel endpoint
    }, [endpoint]);

    // Gestion du défilement pour charger les pages suivantes
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || loading || !hasMore) return;

            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                setPage((prevPage) => prevPage + 1); // Charger la page suivante
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [loading, hasMore]);

    // Charger les posts lorsque la page change
    useEffect(() => {
        if (page > 1) {
            fetchPosts(page);
        }
    }, [page]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (posts.length === 0 && !loading) {
                fetchPosts(1);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [posts, loading]);

    const handleDeletePost = (postId: number) => {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    };

    return (
        <div ref={containerRef} className={`overflow-y-auto scrollbar-thin ${className || ''}`} style={{ maxHeight: '80vh' }}>
            {posts.map((post) => (
                <Post
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                />
            ))}
            {loading && <div className="text-custom text-center mt-4">Loading...</div>}
        </div>
    );
}

export default PostList;