import { useState } from 'react';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import PostList from '../components/Post/PostList';
import RefreshButton from '../ui/Refresh/index';

const Feed = () => {
    const [activeTab, setActiveTab] = useState<'foryou' | 'subscribement'>('foryou');
    const userId = localStorage.getItem('user_id');
    const endpoint = activeTab === 'foryou' ? '/posts' : `/subscriptions/posts/${userId}`;

    return (
        <section className="bg-custom pb-15 flex flex-col w-full h-screen">
            <RefreshButton onRefresh={() => window.location.reload()} />
            <ThreadsIcon size="large" className="self-center my-6" />
            <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
                <p
                    className={`cursor-pointer pb-5 w-half ${activeTab === 'foryou' ? 'border-b-4 border-custom-light-gray' : ''}`}
                    onClick={() => setActiveTab('foryou')}
                >
                    For you
                </p>
                <p
                    className={`cursor-pointer pb-5 w-half ${activeTab === 'subscribement' ? 'border-b-4 border-custom-light-gray' : ''}`}
                    onClick={() => setActiveTab('subscribement')}
                >
                    Subscribement
                </p>
            </div>
            <PostList endpoint={endpoint} />
        </section>
    );
};

export default Feed;