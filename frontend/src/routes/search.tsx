import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api-request';
import PostList from '../components/Post/PostList';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import FilterModal from '../components/Search/FilterModal';
import SearchBar from '../components/Search/SearchBar';

interface HashtagResult {
  id: number;
  name: string;
  post_count: number;
}

interface UserResult {
  id: number;
  username: string;
  avatar: string | null;
  is_blocked: boolean;
}

interface SearchFormData {
  type: 'all' | 'posts' | 'hashtags' | 'users';
  startDate: string;
  endDate: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') as 'all' | 'posts' | 'hashtags' | 'users') || 'all';
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [formData, setFormData] = useState<SearchFormData>({
    type: type,
    startDate: searchParams.get('start_date') || '',
    endDate: searchParams.get('end_date') || '',
  });
  
  const [hashtags, setHashtags] = useState<HashtagResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalHashtags, setTotalHashtags] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  // Vérifier si on a une requête et rediriger vers explore si non
  useEffect(() => {
    if (!query.trim() && !formData.startDate && !formData.endDate && formData.type === 'all') {
      navigate('/explore');
    }
  }, [query, formData, navigate]);

  useEffect(() => {
    if (!query && !formData.startDate && !formData.endDate) {
      setIsLoading(false);
      return;
    }
    
    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        // Construire les paramètres de recherche
        const params = new URLSearchParams();
        
        if (query) {
          params.append('q', query);
        }
        
        params.append('type', formData.type);
        
        if (formData.startDate) {
          params.append('start_date', formData.startDate);
        }
        
        if (formData.endDate) {
          params.append('end_date', formData.endDate);
        }
        
        const response = await apiRequest(`/search?${params.toString()}`, { method: 'GET' });
        const data = await response.json();
        
        if (formData.type === 'hashtags' || formData.type === 'all') {
          setHashtags(data.hashtags || []);
          setTotalHashtags(data.total_hashtags || data.total || 0);
        }
        
        if (formData.type === 'users' || formData.type === 'all') {
          setUsers(data.users || []);
          setTotalUsers(data.total_users || data.total || 0);
        }
        
        if (formData.type === 'posts' || formData.type === 'all') {
          setTotalPosts(data.total_posts || data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query, formData]);

  // Mettre à jour les données du formulaire lorsque les paramètres d'URL changent
  useEffect(() => {
    setFormData({
      type: (searchParams.get('type') as 'all' | 'posts' | 'hashtags' | 'users') || 'all',
      startDate: searchParams.get('start_date') || '',
      endDate: searchParams.get('end_date') || '',
    });
  }, [searchParams]);
  
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  // Créer un titre approprié
  const getSearchTitle = () => {
    if (query) {
      return `Search Results for "${query}"`;
    } 
    
    if (formData.startDate || formData.endDate) {
      return 'Search by Date';
    }
    
    if (formData.type !== 'all') {
      return `Search by Type: ${formData.type}`;
    }
    
    return 'Search';
  };
  
  return (
    <section className="bg-custom pb-15 flex flex-col w-full h-screen">
      <Link to="/" className="self-center mt-6">
        <ThreadsIcon size="large" className="self-center mb-6" />
      </Link>
      
      <h1 className="text-custom-light-gray text-2xl font-bold mb-4 text-center">
        {getSearchTitle()}
      </h1>
      
      <div className="px-4 mb-6">
        <div className="flex items-center">
          <SearchBar className="flex-grow" defaultValue={query} />
          <button
            onClick={openFilterModal}
            className="ml-3 bg-custom-dark-gray text-custom-light-gray border border-custom-gray rounded-md px-4 py-2 hover:bg-custom-gray transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
          </button>
        </div>
        
        {/* Afficher les filtres actifs sous forme de tags */}
        {(formData.type !== 'all' || formData.startDate || formData.endDate) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.type !== 'all' && (
              <div className="bg-custom-dark-gray text-custom-light-gray px-3 py-1 rounded-full text-sm flex items-center">
                Type: {formData.type}
              </div>
            )}
            {formData.startDate && (
              <div className="bg-custom-dark-gray text-custom-light-gray px-3 py-1 rounded-full text-sm flex items-center">
                From: {formData.startDate}
              </div>
            )}
            {formData.endDate && (
              <div className="bg-custom-dark-gray text-custom-light-gray px-3 py-1 rounded-full text-sm flex items-center">
                To: {formData.endDate}
              </div>
            )}

            <Link 
              to="/search" 
              className="bg-custom-red text-white px-3 py-1 rounded-full text-sm flex items-center"
            >
              Clear filters
            </Link>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center text-custom-light-gray py-4">Loading results...</div>
      ) : (
        <div className="px-4 bg-custom pb-15">
          {/* Résultats des hashtags */}
          {(formData.type === 'hashtags' || formData.type === 'all') && hashtags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-3">
                Hashtags {formData.type === 'all' ? `(${totalHashtags})` : ''}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hashtags.map(hashtag => (
                  <Link 
                    key={hashtag.id}
                    to={`/search?q=%23${hashtag.name}`}
                    className="bg-custom-dark-gray rounded-lg p-3 hover:bg-custom-gray transition"
                  >
                    <p className="text-custom-blue font-bold">#{hashtag.name}</p>
                    <p className="text-custom-light-gray text-sm">{hashtag.post_count} posts</p>
                  </Link>
                ))}
              </div>
              
              {formData.type === 'all' && totalHashtags > hashtags.length && (
                <Link 
                  to={`/search?q=${query}&type=hashtags`}
                  className="block text-custom-blue text-center mt-3 hover:underline"
                >
                  See all {totalHashtags} hashtags
                </Link>
              )}
            </div>
          )}
          
          {/* Résultats des utilisateurs */}
          {(formData.type === 'users' || formData.type === 'all') && users.length > 0 && (
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-3">
                Users {formData.type === 'all' ? `(${totalUsers})` : ''}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map(user => (
                  <Link 
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="bg-custom-dark-gray rounded-lg p-3 flex items-center gap-3 hover:bg-custom-gray transition"
                  >
                    <img 
                      src={user.avatar || '/default-avatar.webp'} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className={`font-bold ${user.is_blocked ? 'text-custom-red' : 'text-white'}`}>
                        @{user.username}
                      </p>
                      {user.is_blocked && (
                        <p className="text-custom-red text-sm">Account blocked</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {formData.type === 'all' && totalUsers > users.length && (
                <Link 
                  to={`/search?q=${query}&type=users`}
                  className="block text-custom-blue text-center mt-3 hover:underline"
                >
                  See all {totalUsers} users
                </Link>
              )}
            </div>
          )}
          
          {/* Résultats des posts */}
          {(formData.type === 'posts' || formData.type === 'all') && query && (
            <div className='bg-custom'>
              <h2 className="text-white text-xl font-semibold mb-3">
                Posts {totalPosts > 0 ? `(${totalPosts})` : ''}
              </h2>
              <PostList endpoint={`/search?q=${encodeURIComponent(query)}&type=posts${formData.startDate ? `&start_date=${formData.startDate}` : ''}${formData.endDate ? `&end_date=${formData.endDate}` : ''}`} />
            </div>
          )}
          
          {totalHashtags === 0 && totalUsers === 0 && totalPosts === 0 && (
            <div className="text-center text-custom-light-gray py-8">
              {query ? `No results found for "${query}"` : 'Enter a search term to find content'}
            </div>
          )}
        </div>
      )}
      
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        initialQuery={query}
        initialType={formData.type as any}
        initialStartDate={formData.startDate}
        initialEndDate={formData.endDate}
      />
    </section>
  );
};

export default Search; 