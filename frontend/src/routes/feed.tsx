import React, { useEffect, useState, useRef, JSX } from 'react';
import { apiRequest } from '../lib/api-request';
import { Post } from '../components/Post/Post';
import { PostSkeleton } from '../components/Post/PostSkeleton';
import { timeAgo } from '../lib/utils';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import { useNavigate } from 'react-router-dom';

interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
  avatar: string; // Added avatar property
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
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadPosts() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        setLoading(false);
        return;
      }
  
      try {
        const data = await fetchFeedPosts(page);
  
        // Évitez les doublons en vérifiant les IDs des posts
        setPosts(prevPosts => {
          const existingPostIds = new Set(prevPosts.map(post => post.id));
          const newPosts = (data.posts as PostData[]).filter((post: PostData) => !existingPostIds.has(post.id));
          return [...prevPosts, ...newPosts];
        });
  
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
    <section className='bg-custom pb-15 flex flex-col w-full h-screen'>
        <ThreadsIcon size="large" className='self-center my-6' />
      <div className='overflow-y-auto flex-1 scrollbar-thin'>
        {posts.map((post, index) => (
          <div ref={index === posts.length - 1 ? lastPostRef : null} key={`${post.id}-${index}`}>
        <Post
          username={post.username}
          content={post.content}
          date={timeAgo(new Date(post.created_at))}
          avatar={post.avatar}
        />
          </div>
        ))}
        {loading && <PostSkeleton />}
      </div>
    </section>
  );
}

export { Feed };