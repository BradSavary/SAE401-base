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
  created_at: { date: string; timezone_type: number; timezone: string };
  avatar: string | null;
  user_id: number;
  userLiked: boolean;
  isBlocked: boolean; // Added property to fix the error
}

function Feed(): JSX.Element {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'foryou' | 'subscribement'>('foryou');
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const user_id = localStorage.getItem('user_id');
  const [isFetching, setIsFetching] = useState(false);

  const refreshFeed = async () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    await loadPosts(1);
  };

  const handleDeletePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const loadPosts = async (currentPage: number) => {
    if (isFetching) return; // Empêche les appels multiples
    setIsFetching(true); // Active le verrou
  
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
  
    setLoading(true);
    try {
      const endpoint =
        activeTab === 'foryou'
          ? `/posts?page=${currentPage}`
          : `/subscriptions/posts/${user_id}`;
      const response = await apiRequest<{ posts: PostData[]; previous_page: number | null; next_page: number | null }>(endpoint);
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data);
  
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid API response: Expected an array of posts');
      }
  
      const updatedPosts = data.posts.map((post: PostData) => ({
        ...post,
        created_at: {
          date: new Date(post.created_at).toISOString(),
        },
      }));
  
      setPosts(prevPosts => {
        const existingPostIds = new Set(prevPosts.map(post => post.id));
        const newPosts = updatedPosts.filter((post: PostData) => !existingPostIds.has(post.id));
        return [...prevPosts, ...newPosts];
      });
  
      setHasMore(data.next_page !== null);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setIsFetching(false); // Libère le verrou
    }
  };

  useEffect(() => {
    // Réinitialise les posts et recharge les posts pour l'onglet actif
    async function fetchPostsForActiveTab() {
      setPosts([]); // Réinitialise les posts
      setPage(1); // Réinitialise la pagination
      setHasMore(true); // Réinitialise l'indicateur de pagination
      setError(null); // Réinitialise les erreurs
      await loadPosts(1); // Charge les posts pour la première page de l'onglet actif
    }
  
    fetchPostsForActiveTab();
  }, [activeTab]);
  
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
  
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && !isFetching) {
        setPage(prevPage => prevPage + 1); // Incrémente la page uniquement si toutes les conditions sont remplies
      }
    });
  
    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }
  
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading, isFetching]);
  
  useEffect(() => {
    if (page === 1 && posts.length === 0) return; // Évite de recharger les posts déjà chargés
    if (!isFetching) {
      loadPosts(page); // Charge les posts pour la page actuelle
    }
  }, [page]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section className="bg-custom pb-15 flex flex-col w-full h-screen">
      <ThreadsIcon size="large" className="self-center my-6" />
      <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
  <p
    className={`cursor-pointer pb-5 w-half ${
      activeTab === 'foryou' ? 'border-b-4 border-custom-light-gray' : ''
    }`}
    onClick={() => {
      setActiveTab('foryou');
    }}
  >
    For you
  </p>
  <p
    className={`cursor-pointer pb-5 w-half ${
      activeTab === 'subscribement' ? 'border-b-4 border-custom-light-gray' : ''
    }`}
    onClick={() => {
      setActiveTab('subscribement');
    }}
  >
    Subscribement
  </p>
</div>
      <RefreshButton onRefresh={refreshFeed} />
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {posts.map(post => (
          <Post
          key={post.id}
          username={post.username}
          content={post.content}
          date={timeAgo(new Date(post.created_at.date))} // Utilisation correcte de la date
          avatar={post.avatar ?? undefined}
          user_id={post.user_id}
          post_id={post.id}
          onDelete={handleDeletePost}
          userLiked={post.userLiked}
          isBlocked={post.isBlocked} // Passe l'état de blocage
        />
        ))}
        {loading && <PostSkeleton />}
        <div ref={lastPostRef} className="h-1" />
      </div>
    </section>
  );
}

export { Feed };