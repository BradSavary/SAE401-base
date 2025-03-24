import React, { useEffect, useState, useRef, JSX } from 'react';
import { apiRequest } from '../lib/api-request';
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

async function fetchFeedPosts(page: number) {
  try {
    const response = await apiRequest<{ posts: any[], next_page: number | null }>(`/posts?page=${page}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

function Feed(): JSX.Element {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadPosts() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No valid token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchFeedPosts(page);
        setPosts(prevPosts => [...prevPosts, ...data.posts]);
        setHasMore(data.next_page !== null);
      } catch (error) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [page]);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }
  }, [loading, hasMore]);

  if (loading && page === 1) {
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
    <section className='bg-custom pb-15 flex flex-col w-full pt-6'>
      <ThreadsIcon size="large" className='self-center' />
      {posts.map((post, index) => (
        <div ref={index === posts.length - 1 ? lastPostRef : null}>
          <Post
            key={post.id}
            username={post.username}
            content={post.content}
            date={timeAgo(new Date(post.created_at))}
          />
        </div>
      ))}
      {loading && <PostSkeleton />}
    </section>
  );
}

export { Feed };