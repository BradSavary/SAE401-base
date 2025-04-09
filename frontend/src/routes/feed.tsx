import { useState, useEffect } from 'react';
import PostList from '../components/Post/PostList';
import RefreshButton from '../ui/Refresh/index';
import Tabs from '../ui/Tabs/Tabs';
import PageHeader from '../components/Header/PageHeader';

const Feed = () => {
    const [activeTab, setActiveTab] = useState<string>('foryou');
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

    const handleTabChange = (tabId: string) => {
        if (tabId === 'subscribement' && !userId) {
            alert('Veuillez vous connecter pour voir vos abonnements');
            return;
        }
        setActiveTab(tabId);
    };

    // Configuration des onglets
    const tabs = [
        { id: 'foryou', label: 'For you' },
        { id: 'subscribement', label: 'Subscribement' }
    ];

    return (
        <section className="bg-custom flex flex-col w-full h-screen overflow-hidden">
            <div className="md:max-w-xl md:mx-auto w-full flex flex-col h-full">
                <RefreshButton onRefresh={() => window.location.reload()} />
                
                {/* En-tête fixe avec logo et tabs */}
                <div className="flex flex-col">
                    <PageHeader 
                        logoSize="large"
                        showBackButton={false}
                        className="my-6"
                    />
                    
                    <Tabs 
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        tabWidth="half"
                        className="pt-2"
                    />
                </div>
                
                {/* Zone de contenu avec défilement */}
                <div className="flex-grow overflow-hidden mb-16 md:mb-4">
                    <div className="h-full overflow-auto">
                        <PostList endpoint={getEndpoint()} className="md:px-4" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Feed;