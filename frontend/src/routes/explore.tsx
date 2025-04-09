import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/Header/PageHeader';
import SearchFilterBar from '../components/Search/SearchFilterBar';
import TrendingHashtagsGrid from '../components/Hashtag/TrendingHashtagsGrid';

const Explore = () => {
  const [searchParams] = useSearchParams();

  // Récupérer les paramètres de filtres de l'URL
  const type = searchParams.get('type') || 'all';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';

  return (
    <section className="bg-custom flex flex-col w-full pb-16">
      <div className="w-full md:max-w-2xl md:mx-auto">
        <PageHeader 
          title="Explore" 
          logoSize="large" 
          className="mt-6 mb-4"
        />
        
        {/* Première section: Filtre de recherche */}
        <div className="mb-6 px-4">
          <SearchFilterBar 
            placeholder="Search for hashtags, users, or content..."
            initialType={type}
            initialStartDate={startDate}
            initialEndDate={endDate}
            returnUrl="/explore"
            className=""
          />
        </div>
        
        {/* Deuxième section: Hashtags populaires */}
        <div className="px-4 bg-custom">
          <h2 className="text-2xl font-bold text-custom mb-4">Trending Hashtags</h2>
          <TrendingHashtagsGrid 
            limit={50}
            type={type}
            startDate={startDate}
            endDate={endDate}
            columns={2}
            showTitle={false}
            className="pb-4"
          />
        </div>
      </div>
    </section>
  );
};

export default Explore; 