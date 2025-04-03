import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full mb-4">
      <input
        type="text"
        placeholder="Search content..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-grow p-2 border border-custom-gray rounded-l bg-custom-dark-gray text-white focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar; 