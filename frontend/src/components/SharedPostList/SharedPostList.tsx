import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api-request';
import Post from '../Post/Post';

interface SharedPostListProps {
    endpoint: string;
}

const SharedPostList: React.FC<SharedPostListProps> = ({ endpoint }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await apiRequest(endpoint);
                const data = await response.json();
                setPosts(data.posts);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [endpoint]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {posts.map(post => (
                <Post key={post.id} {...post} />
            ))}
        </div>
    );
};

export default SharedPostList;