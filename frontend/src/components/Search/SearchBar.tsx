import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  buttonText?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for hashtags, users, or content...',
  className = '',
  defaultValue = '',
  buttonText = 'Search',
}) => {
  const [query, setQuery] = useState<string>(defaultValue);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      // Rediriger vers la page de recherche avec la requête
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      // Si l'input est vide, comportement différent selon la page
      if (location.pathname === '/search') {
        // Si on est déjà sur la page search, retour à la page explore
        navigate('/explore');
      } else if (location.pathname === '/explore') {
        // Si on est sur la page explore, rafraîchir la page (réinitialiser les filtres)
        window.location.reload();
      } else {
        // Sur d'autres pages, rediriger vers explore
        navigate('/explore');
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={`flex w-full ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-grow rounded-l-md bg-custom-dark-gray border border-custom-gray text-custom-light-gray p-2 focus:outline-none focus:border-custom-blue"
      />
      <button
        type="submit"
        className="bg-custom-blue text-white rounded-r-md px-4 py-2 hover:bg-blue-700 transition"
      >
        {buttonText}
      </button>
    </form>
  );
};

export default SearchBar; 