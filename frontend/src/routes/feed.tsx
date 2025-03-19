import React, { useEffect, useState, JSX } from 'react';
import { fetchFeedPosts } from '../data/post';
import { Post } from '../components/Post/Post';
import { timeAgo } from '../lib/utils';

interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

function Feed(): JSX.Element {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No valid token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const postsData = await fetchFeedPosts();
        setPosts(postsData);
      } catch (error) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section className='bg-custom pb-15'>
      {posts.map(post => (
        <Post
          key={post.id}
          username={post.username}
          content={post.content}
          date={timeAgo(new Date(post.created_at))}
        />
      ))}
    </section>
  );
}

export { Feed };