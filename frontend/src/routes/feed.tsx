import React, { useEffect, useState, useRef, JSX } from 'react';
import { apiRequest } from '../lib/api-request';
import { Post } from '../components/Post/Post';
import { PostSkeleton } from '../components/Post/PostSkeleton';
import { timeAgo } from '../lib/utils';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import { useNavigate } from 'react-router-dom';
import RefreshButton from '../ui/Refresh/index'; 


interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
  avatar: string; // Added avatar property
  user_id: number; // Ajout de la propriété user_id
  userLiked: boolean; // Added userLiked property
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
  const [loading, setLoading] = useState<boolean>(false); // Initialisé à false pour éviter les conflits
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const handleDeletePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const loadPosts = async (currentPage: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchFeedPosts(currentPage);

      setPosts(prevPosts => {
        const existingPostIds = new Set(prevPosts.map(post => post.id));
        const newPosts = (data.posts as PostData[]).filter(post => !existingPostIds.has(post.id));
        return [...prevPosts, ...newPosts];
      });

      setHasMore(data.next_page !== null);
    } catch (error) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(page);
  }, [page]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section className='bg-custom pb-15 flex flex-col w-full h-screen'>
      <ThreadsIcon size="large" className='self-center my-6' />
      <RefreshButton onRefresh={() => loadPosts(1)} />
      <div className='overflow-y-auto flex-1 scrollbar-thin'>
        {posts.map((post, index) => (
          <Post
          key={post.id}
          username={post.username}
          content={post.content}
          date={timeAgo(new Date(post.created_at))}
          avatar={post.avatar}
          user_id={post.user_id}
          post_id={post.id}
          onDelete={handleDeletePost}
          userLiked={post.userLiked} // Passe l'état du like
        />
        ))}
        {loading && <PostSkeleton />}
        <div ref={lastPostRef} className="h-1" />
      </div>
    </section>
  );
}

export { Feed };