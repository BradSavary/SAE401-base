import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api-request';
import ModerationService from '../../../lib/moderation-service';
import ContentList from './ContentList';
import SearchBar from './SearchBar';
import LoadingIcon from '../../../ui/Loading/LoadingIcon';

interface ContentModerationPanelProps {
  type: 'posts' | 'comments';
}

const ContentModerationPanel: React.FC<ContentModerationPanelProps> = ({ type }) => {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [totalItems, setTotalItems] = useState<number>(0);
  const [previousType, setPreviousType] = useState<string>(type);

  const fetchContent = async (pageToLoad: number, searchTerm: string = '') => {
    setLoading(true);
    try {
      const endpoint = `/moderation/${type}?page=${pageToLoad}&limit=15${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
      const response = await apiRequest(endpoint);
      
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des ${type}`);
      }
      
      const data = await response.json();
      
      if (pageToLoad === 1) {
        setContent(data[type]);
      } else {
        setContent(prev => [...prev, ...data[type]]);
      }
      
      setHasMore(data.next_page !== null);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error(`Erreur lors du chargement des ${type}:`, error);
      setError(`Échec du chargement des ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const searchContent = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let results;
      if (type === 'posts') {
        results = await ModerationService.searchPosts(searchTerm);
        setContent(results.posts || []);
        setTotalItems(results.total || results.posts?.length || 0);
      } else {
        results = await ModerationService.searchComments(searchTerm);
        setContent(results.comments || []);
        setTotalItems(results.total || results.comments?.length || 0);
      }
      
      setHasMore(false); // Pas de pagination pour les résultats de recherche
    } catch (error) {
      console.error(`Erreur lors de la recherche de ${type}:`, error);
      setError(`Échec de la recherche`);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  // Effet qui détecte le changement de type (posts vs comments)
  useEffect(() => {
    if (type !== previousType) {
      // Réinitialiser complètement l'état lors du changement d'onglet
      setContent([]);
      setPage(1);
      setHasMore(true);
      setSearch('');
      setError(null);
      setPreviousType(type);
      
      // Charger le nouveau contenu
      fetchContent(1, '');
    }
  }, [type, previousType]);

  // Effet pour rechercher ou charger le contenu quand la recherche change
  useEffect(() => {
    if (type === previousType) { // Ne pas recharger si on vient de changer d'onglet
      setContent([]);
      setPage(1);
      setHasMore(true);
      
      if (search) {
        searchContent(search);
      } else {
        fetchContent(1);
      }
    }
  }, [search]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchContent(nextPage, search);
    }
  };

  const handleCensorContent = async (id: number, isCensored: boolean) => {
    try {
      if (type === 'posts') {
        await ModerationService.censorPost(id, isCensored);
      } else {
        await ModerationService.censorComment(id, isCensored);
      }
      
      // Mettre à jour l'état local après la censure
      setContent(prevContent => 
        prevContent.map(item => 
          item.id === id ? { ...item, is_censored: isCensored } : item
        )
      );
    } catch (error) {
      console.error('Erreur lors de la censure du contenu:', error);
    }
  };

  const handleDeleteContent = async (id: number) => {
    try {
      if (type === 'posts') {
        await ModerationService.deletePost(id);
      } else {
        await ModerationService.deleteComment(id);
      }
      
      // Mettre à jour l'état local après la suppression
      setContent(prevContent => 
        prevContent.filter(item => item.id !== id)
      );
      setTotalItems(prev => prev - 1);
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-custom">{type === 'posts' ? 'Posts' : 'Comments'}</h2>
        <span className="text-custom-light-gray">Total: {totalItems}</span>
      </div>
      
      <SearchBar onSearch={handleSearch} />
      
      {loading && content.length === 0 ? (
        <div className="flex justify-center p-8">
          <LoadingIcon size="large" alt="Loading" />
        </div>
      ) : (
        <>
          <ContentList 
            items={content} 
            type={type} 
            onCensor={handleCensorContent}
            onDelete={handleDeleteContent}
          />
          
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 bg-custom-dark-gray text-white rounded hover:bg-custom-gray cursor-pointer"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
          
          {!hasMore && content.length > 0 && (
            <p className="text-center text-custom-light-gray mt-4">
              No more content available
            </p>
          )}
          
          {content.length === 0 && (
            <p className="text-center text-custom-light-gray p-8">
              No {type === 'posts' ? 'posts' : 'comments'} found
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ContentModerationPanel; 