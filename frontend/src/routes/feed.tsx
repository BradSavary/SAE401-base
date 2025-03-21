import React, { useEffect, useState, JSX } from 'react';
import { fetchFeedPosts } from '../data/post';
import { Post } from '../components/Post/Post';
import { PostSkeleton } from '../components/Post/PostSkeleton';
import { timeAgo } from '../lib/utils';
import { ThreadsIcon } from '../ui/LogoIcon/threads';

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
    return (
      <section className='bg-custom pb-15 flex flex-col items-center w-full pt-6'>
        <ThreadsIcon size="large" className='self-center' />
        {[...Array(5)].map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </section>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section className='bg-custom pb-15 flex flex-col items-center w-full pt-6'>
      <ThreadsIcon size="large" className='self-center' />
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