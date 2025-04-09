import React from 'react';
import { useNavigate } from "react-router-dom";
import PageHeader from '../components/Header/PageHeader';
import PostForm from '../components/Post/PostForm';

export function Write() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/feed');
    };

    const handleError = (message: string) => {
        console.error('Error creating post:', message);
        // Optionally show a toast or notification here
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-custom p-4 gap-8">
            <div className="w-full md:max-w-2xl md:mx-auto">
                <PageHeader 
                    title="New Thread" 
                    showLogo={false}
                    showBackButton={true}
                    backTo="/feed"
                    className="mb-4 w-full"
                />
                
                <PostForm 
                    onSuccess={handleSuccess} 
                    onError={handleError}
                    className="w-full"
                />
            </div>
        </div>
    );
}