import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api-request';
import Card from '../../ui/Card/Card';
import Badge from '../../ui/Badge/Badge';
import { HashtagsSkeleton } from './HashtagsSkeleton';

interface HashtagData {
    id: number;
    name: string;
    post_count: number;
}

interface TrendingHashtagsGridProps {
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    title?: string;
    showTitle?: boolean;
    columns?: 1 | 2 | 3 | 4;
    onHashtagClick?: (hashtag: HashtagData) => void;
    className?: string;
}

const TrendingHashtagsGrid: React.FC<TrendingHashtagsGridProps> = ({
    limit = 50,
    type = 'all',
    startDate = '',
    endDate = '',
    title = 'Trending Hashtags',
    showTitle = true,
    columns = 2,
    onHashtagClick,
    className = ''
}) => {
    const [hashtags, setHashtags] = useState<HashtagData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrendingHashtags = async () => {
            setIsLoading(true);
            setError('');
            
            try {
                // Construire les paramètres de la requête
                let endpoint = `/hashtags/trending?limit=${limit}`;
                
                // Ajouter les filtres si présents
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
    }, [limit, type, startDate, endDate]);

    const handleHashtagClick = (hashtag: HashtagData) => {
        if (onHashtagClick) {
            onHashtagClick(hashtag);
        } else {
            navigate(`/search?q=%23${hashtag.name}`);
        }
    };

    const getGridColumns = () => {
        switch (columns) {
            case 1: return 'grid-cols-1';
            case 3: return 'grid-cols-1 md:grid-cols-3';
            case 4: return 'grid-cols-2 md:grid-cols-4';
            case 2:
            default: return 'grid-cols-2 md:grid-cols-2';
        }
    };

    return (
        <div className={`${className}`}>
            {showTitle && (
                <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>
            )}
            
            {isLoading ? (
                <HashtagsSkeleton columns={columns} count={limit > 10 ? 10 : limit} />
            ) : error ? (
                <div className="text-center text-custom-red py-4">{error}</div>
            ) : hashtags.length === 0 ? (
                <div className="text-center text-custom-light-gray py-4">No trending hashtags found</div>
            ) : (
                <div className={`grid ${getGridColumns()} gap-4`}>
                    {hashtags.map((hashtag) => (
                        <Card
                            key={hashtag.id}
                            variant="secondary"
                            padding="md"
                            hover="highlight"
                            radius="lg"
                            className="cursor-pointer"
                            onClick={() => handleHashtagClick(hashtag)}
                        >
                            <p className="text-custom-blue font-bold">#{hashtag.name}</p>
                            <Badge variant="primary" size="sm" className="mt-2">
                                {hashtag.post_count} posts
                            </Badge>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrendingHashtagsGrid; 