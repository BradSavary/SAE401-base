import { useState, useEffect } from 'react';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import PostList from '../components/Post/PostList';
import RefreshButton from '../ui/Refresh/index';

const Feed = () => {
    const [activeTab, setActiveTab] = useState<'foryou' | 'subscribement'>('foryou');
    const [userId, setUserId] = useState<string | null>(null);
    
    useEffect(() => {
        // Récupérer l'ID de l'utilisateur au chargement du composant
        const storedUserId = localStorage.getItem('user_id');
        setUserId(storedUserId);
    }, []);
    
    // S'assurer que nous avons un endpoint valide même si userId est null
    const getEndpoint = () => {
        if (activeTab === 'foryou') {
            return '/posts';
        } else if (activeTab === 'subscribement' && userId) {
            return `/subscriptions/posts/${userId}`;
        }
        return '/posts'; // Fallback si pas d'utilisateur connecté
    };

    const handleTabChange = (tab: 'foryou' | 'subscribement') => {
        if (tab === 'subscribement' && !userId) {
            alert('Veuillez vous connecter pour voir vos abonnements');
            return;
        }
        setActiveTab(tab);
    };

    return (
        <section className="bg-custom pb-15 flex flex-col w-full h-screen">
            <RefreshButton onRefresh={() => window.location.reload()} />
            <ThreadsIcon size="large" className="self-center my-6" />
            
            <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
                <p
                    className={`cursor-pointer pb-5 w-half ${activeTab === 'foryou' ? 'border-b-4 border-custom-light-gray' : ''}`}
                    onClick={() => handleTabChange('foryou')}
                >
                    For you
                </p>
                <p
                    className={`cursor-pointer pb-5 w-half ${activeTab === 'subscribement' ? 'border-b-4 border-custom-light-gray' : ''}`}
                    onClick={() => handleTabChange('subscribement')}
                >
                    Subscribement
                </p>
            </div>
            <PostList endpoint={getEndpoint()} />
        </section>
    );
};

export default Feed;