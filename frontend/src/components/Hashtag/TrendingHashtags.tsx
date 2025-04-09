import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api-request';
import { HashtagsSkeleton } from './HashtagsSkeleton';

interface HashtagData {
  id: number;
  name: string;
  post_count: number;
}

interface TrendingHashtagsProps {
  limit?: number;
  className?: string;
}

const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({
  limit = 5,
  className = '',
}) => {
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await apiRequest(`/hashtags/trending?limit=${limit}`, {
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
  }, [limit]);

  if (isLoading) {
    return (
      <div className="bg-custom rounded-lg p-4">
        <h2 className="text-white text-xl font-semibold mb-4">Trending Hashtags</h2>
        <HashtagsSkeleton columns={1} count={limit} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-custom-red p-4">{error}</div>;
  }

  if (hashtags.length === 0) {
    return <div className="text-center text-custom-light-gray p-4">No trending hashtags found</div>;
  }

  return (
    <div className={`bg-custom rounded-lg p-4 ${className}`}>
      <h2 className="text-white text-xl font-semibold mb-4">Trending Hashtags</h2>
      <ul className="space-y-3 bg-custom">
        {hashtags.map((hashtag) => (
          <li key={hashtag.id}>
            <Link
              to={`/search?q=%23${hashtag.name}`}
              className="flex justify-between items-center hover:bg-custom-gray p-2 rounded-md transition"
            >
              <span className="text-custom-blue font-bold">#{hashtag.name}</span>
              <span className="text-custom-light-gray text-sm">{hashtag.post_count} posts</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-center">
        <Link to="/explore" className="text-custom-blue hover:underline">
          See more trends
        </Link>
      </div>
    </div>
  );
};

export default TrendingHashtags; 