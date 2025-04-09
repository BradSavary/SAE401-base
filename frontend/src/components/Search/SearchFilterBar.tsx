import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterModal from './FilterModal';
import Card from '../../ui/Card/Card';
import Button from '../../ui/Button/Button';
import Badge from '../../ui/Badge/Badge';

interface SearchFilterBarProps {
    placeholder?: string;
    initialQuery?: string;
    initialType?: string;
    initialStartDate?: string;
    initialEndDate?: string;
    showFilters?: boolean;
    returnUrl?: string;
    onSearch?: (query: string) => void;
    className?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    placeholder = "Search...",
    initialQuery = "",
    initialType = "all",
    initialStartDate = "",
    initialEndDate = "",
    showFilters = true,
    returnUrl = "/explore",
    onSearch,
    className = ""
}) => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    
    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    // Vérifier s'il y a des filtres actifs
    const hasActiveFilters = initialType !== 'all' || initialStartDate || initialEndDate;

    return (
        <>
            <Card variant="primary" padding="md" className={`border-none shadow-none ${className}`}>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <SearchBar 
                        className="w-full" 
                        placeholder={placeholder}
                        defaultValue={initialQuery}
                        buttonText="Search"
                    />
                    
                    {showFilters && (
                        <Button
                            variant="quaternary"
                            onClick={openFilterModal}
                            className="w-full sm:w-auto flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                            Filters
                        </Button>
                    )}
                </div>
                
                {/* Afficher les filtres actifs si présents */}
                {hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {initialType !== 'all' && (
                            <Badge variant="secondary" size="md">Type: {initialType}</Badge>
                        )}
                        {initialStartDate && (
                            <Badge variant="secondary" size="md">From: {initialStartDate}</Badge>
                        )}
                        {initialEndDate && (
                            <Badge variant="secondary" size="md">To: {initialEndDate}</Badge>
                        )}
                        
                        <Link to={returnUrl}>
                            <Badge variant="danger" size="md" className="cursor-pointer">Clear filters</Badge>
                        </Link>
                    </div>
                )}
            </Card>

            {showFilters && (
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    initialQuery={initialQuery}
                    initialType={initialType as any}
                    initialStartDate={initialStartDate}
                    initialEndDate={initialEndDate}
                />
            )}
        </>
    );
};

export default SearchFilterBar; 