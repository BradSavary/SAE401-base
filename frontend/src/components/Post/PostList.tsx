import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../../lib/api-request';
import Post from './Post';

interface PostData {
    id: number;
    username: string;
    content: string;
    created_at: { date: string; timezone_type: number; timezone: string };
    avatar: string | null;
    user_id: number;
    userLiked: boolean;
    isBlocked: boolean;
    media: string | null; // URL du média associé au post
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
                    const filteredPosts: PostData[] = newPosts.filter((post: PostData) => !existingIds.has(post.id));
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

    return (
        <div ref={containerRef} className={`overflow-y-auto scrollbar-thin ${className || ''}`} style={{ maxHeight: '80vh' }}>
            {posts.map((post) => (
                <Post
                    key={post.id}
                    id={post.id}
                    username={post.username}
                    content={post.content}
                    created_at={post.created_at}
                    avatar={post.avatar}
                    user_id={post.user_id}
                    userLiked={post.userLiked}
                    isBlocked={post.isBlocked}
                    onDelete={(postId) => setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId))}
                    media={post.media} // Passer le média au composant Post
                />
            ))}
            {loading && <div className="text-custom text-center mt-4">Loading...</div>}
        </div>
    );
}

export default PostList;