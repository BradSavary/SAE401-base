import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  initialType?: 'all' | 'content' | 'hashtags' | 'mentions' | 'users';
  initialStartDate?: string;
  initialEndDate?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
  initialType = 'all',
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'all' | 'content' | 'hashtags' | 'mentions' | 'users'>(initialType);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Mettre à jour les états quand les props changent
    setQuery(initialQuery);
    setSearchType(initialType);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [initialQuery, initialType, initialStartDate, initialEndDate, isOpen]);

  // Détecter automatiquement le type de recherche en fonction de la saisie
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Détecter le type de recherche si l'utilisateur n'a pas explicitement choisi
    if (value.startsWith('#')) {
      setSearchType('hashtags');
    } else if (value.startsWith('@')) {
      setSearchType('mentions');
    } else {
      // Si pas de préfixe spécifique, on peut laisser le type tel quel ou revenir à 'all'
      // setSearchType('all');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si la requête est vide et qu'aucun filtre n'est appliqué
    if (!query.trim() && searchType === 'all' && !startDate && !endDate) {
      // Retour à la page explore
      navigate('/explore');
      onClose();
      return;
    }
    
    // Si la requête est vide mais des filtres sont appliqués
    if (!query.trim()) {
      // Rediriger vers explore avec les filtres
      const params = new URLSearchParams();
      
      if (searchType !== 'all') {
        params.set('type', searchType);
      }
      
      if (startDate) {
        params.set('start_date', startDate);
      }
      
      if (endDate) {
        params.set('end_date', endDate);
      }
      
      const queryString = params.toString();
      navigate(`/explore${queryString ? `?${queryString}` : ''}`);
      onClose();
      return;
    }
    
    // Si la requête n'est pas vide, comportement normal
    const params = new URLSearchParams();
    
    params.set('q', query);
    
    if (searchType !== 'all') {
      params.set('type', searchType);
    }
    
    if (startDate) {
      params.set('start_date', startDate);
    }
    
    if (endDate) {
      params.set('end_date', endDate);
    }
    
    navigate(`/search?${params.toString()}`);
    onClose();
  };

  const resetFilters = () => {
    setQuery('');
    setSearchType('all');
    setStartDate('');
    setEndDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-custom-dark-gray w-full max-w-md rounded-lg overflow-hidden shadow-xl mx-4">
        <div className="flex justify-between items-center bg-custom-gray p-4 border-b border-custom-light-gray">
          <h2 className="text-white text-lg font-semibold">Advanced Search</h2>
          <button 
            onClick={onClose}
            className="text-custom-light-gray hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="query" className="block text-custom-light-gray mb-1">Search</label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={handleQueryChange}
                placeholder="Type # for hashtags, @ for mentions..."
                className="w-full rounded-md bg-custom border border-custom-gray text-custom-light-gray p-2"
                autoFocus
              />
              <p className="text-sm text-custom-light-gray mt-1">
                {query.startsWith('#') ? 'Searching hashtags' : 
                 query.startsWith('@') ? 'Searching mentions' : 
                 'Searching all content'}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="searchType" className="block text-custom-light-gray mb-1">Search Type</label>
              <select
                id="searchType"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="w-full rounded-md bg-custom border border-custom-gray text-custom-light-gray p-2"
              >
                <option value="all">All Content</option>
                <option value="content">Posts Content</option>
                <option value="hashtags">Hashtags</option>
                <option value="mentions">Mentions</option>
                <option value="users">Users</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="startDate" className="block text-custom-light-gray mb-1">From Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md bg-custom border border-custom-gray text-custom-light-gray p-2"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="endDate" className="block text-custom-light-gray mb-1">To Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md bg-custom border border-custom-gray text-custom-light-gray p-2"
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-md border border-custom-red text-custom-red hover:bg-custom-red hover:text-white transition"
              >
                Reset
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-custom-gray text-custom-light-gray hover:bg-custom-gray transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-custom-blue text-white hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FilterModal; 