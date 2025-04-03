import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api-request';
import Post from '../Post/Post';

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
    isBlocked: boolean;
    media: MediaItem[];
    comments?: CommentData[];
}

interface SharedPostListProps {
    endpoint: string;
}

const SharedPostList: React.FC<SharedPostListProps> = ({ endpoint }) => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await apiRequest(endpoint);
                const data = await response.json();
                
                // Ensure all posts have the correct data format
                const formattedPosts = (data.posts || []).map((post: any) => ({
                    ...post,
                    avatar: post.avatar || '../../../public/default-avata.webp'
                }));
                
                setPosts(formattedPosts);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [endpoint]);

    const handleDelete = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {posts.map(post => (
                <Post 
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
};

export default SharedPostList;