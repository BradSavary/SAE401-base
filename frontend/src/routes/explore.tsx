import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import { apiRequest } from '../lib/api-request';
import SearchBar from '../components/Search/SearchBar';
import FilterModal from '../components/Search/FilterModal';

interface HashtagData {
  id: number;
  name: string;
  post_count: number;
}

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Récupérer les paramètres de filtres de l'URL
  const type = searchParams.get('type') || 'all';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Construire les paramètres de la requête
        let endpoint = '/hashtags/trending?limit=50';
        
        // Ajouter les filtres si présents dans l'URL
        if (type !== 'all' || startDate || endDate) {
          const params = new URLSearchParams();
          
          if (type !== 'all') {
            params.append('type', type);
          }
          
          if (startDate) {
            params.append('start_date', startDate);
          }
          
          if (endDate) {
            params.append('end_date', endDate);
          }
          
          // Ajouter les paramètres à l'endpoint
          if (params.toString()) {
            endpoint += `&${params.toString()}`;
          }
        }
        
        const response = await apiRequest(endpoint, {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending hashtags');
        }
        
        const data = await response.json();
        setHashtags(data.hashtags || []);
      } catch (error) {
        console.error('Error fetching trending hashtags:', error);
        setError('Failed to load trending hashtags');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendingHashtags();
  }, [type, startDate, endDate]);

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  // Afficher les filtres actifs
  const hasActiveFilters = type !== 'all' || startDate || endDate;

  return (
    <section className="bg-custom pb-15 flex flex-col w-full h-screen">
      <Link to="/" className="self-center mt-6">
        <ThreadsIcon size="large" className="self-center mb-6" />
      </Link>
      
      <h1 className="text-white text-2xl font-bold mb-4 text-center">
        Explore
      </h1>
      
      <div className="px-4 mb-6">
        <div className="flex items-center">
          <SearchBar className="flex-grow" placeholder="Search for hashtags, users, or content..." />
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
        
        {/* Afficher les filtres actifs si présents */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {type !== 'all' && (
              <div className="bg-custom-dark-gray text-custom-light-gray px-3 py-1 rounded-full text-sm flex items-center">
                Type: {type}
              </div>
            )}
            {startDate && (
              <div className="bg-custom-dark-gray text-custom-light-gray px-3 py-1 rounded-full text-sm flex items-center">
                From: {startDate}
              </div>
            )}
            {endDate && (
              <div className="bg-custom-dark-gray text-custom-light-gray px-3 py-1 rounded-full text-sm flex items-center">
                To: {endDate}
              </div>
            )}
            
            <Link 
              to="/explore" 
              className="bg-custom-red text-white px-3 py-1 rounded-full text-sm flex items-center"
            >
              Clear filters
            </Link>
          </div>
        )}
      </div>
      
      <div className="mx-4">
        <h2 className="text-white text-xl font-semibold mb-4">Trending Hashtags</h2>
        
        {isLoading ? (
          <div className="text-center text-custom-light-gray py-4">Loading trending hashtags...</div>
        ) : error ? (
          <div className="text-center text-custom-red py-4">{error}</div>
        ) : hashtags.length === 0 ? (
          <div className="text-center text-custom-light-gray py-4">No trending hashtags found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                to={`/search?q=%23${hashtag.name}`}
                className="bg-custom-dark-gray rounded-lg p-4 hover:bg-custom-gray transition"
              >
                <p className="text-custom-blue font-bold">#{hashtag.name}</p>
                <p className="text-custom-light-gray text-sm">{hashtag.post_count} posts</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        initialQuery=""
        initialType={type as any}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </section>
  );
};

export default Explore; 