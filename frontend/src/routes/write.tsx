import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from '../lib/api-request';
import Button from "../ui/Button/Button";
import TextArea from "../ui/TextArea/TextArea";
import { CloseIcon } from "../ui/Icon/close";

export function Write() {
    const [content, setContent] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [media, setMedia] = useState<File | null>(null); // État pour le fichier média
    const [mediaPreview, setMediaPreview] = useState<string | null>(null); // Prévisualisation du média
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const user_id = localStorage.getItem('user_id');

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= 280) {
            setContent(newContent);
            setCharCount(newContent.length);
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedia(file);
            setMediaPreview(URL.createObjectURL(file)); // Génère une URL pour la prévisualisation
        }
    };

    const handlePublish = async () => {
        try {
            const userId = user_id ? parseInt(user_id, 10) : null;
            const formData = new FormData();
            formData.append('content', content);
            if (media) {
                formData.append('media', media); // Ajoute le fichier média
            }
            formData.append('user_id', String(userId));

            const response = await apiRequest('/posts', {
                method: 'POST',
                body: formData, // Envoie les données sous forme de FormData
            });

            if (!response.ok) {
                alert('Failed to publish post. Please try again.');
            } else {
                alert('Post published successfully!');
                navigate('/feed');
            }
        } catch (error) {
            alert('Failed to publish post. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center h-screen bg-custom p-4 gap-8">
            <div className="w-full flex flex-row gap-4">
                <Link to="/feed">
                    <CloseIcon size="xsmall" alt="Close-thread" className="absolute top-0 left-0 m-5" />
                </Link>
                <p className='text-custom pl-8 pt-0.5'>New Thread</p>
            </div>
            <div className="w-full flex flex-col justify-center space-y-4">
                <h2 className="text-custom font-bold">{username}</h2>
                <div>
                    <TextArea
                        className={`{${charCount === 280 ? 'text-red-500' : 'text-custom'}}`}
                        variant="primary"
                        placeholder="Start a thread"
                        value={content}
                        onChange={handleContentChange}
                    />
                </div>
                {mediaPreview && (
            <div className="mt-4">
                {media?.type.startsWith('image') ? (
                    <img src={mediaPreview} alt="Preview" className="w-28 h-28 rounded-md" />
                ) : media?.type.startsWith('video') ? (
                    <video controls className="w-14 h-28 rounded-md">
                        <source src={mediaPreview} type={media?.type} />
                        Your browser does not support the video tag.
                    </video>
                ) : media?.type === 'audio/mpeg' ? (
                    <audio controls className="w-full">
                        <source src={mediaPreview} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio>
                ) : null}
            </div>
        )}
                <div className="flex gap-4 justify-center items-center absolute bottom-0 right-0 mr-6 mb-22">
                <div>
                    <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleMediaChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                    <div className={` ${charCount === 280 ? 'text-red-500' : 'text-gray-500'}`}>{charCount}/280</div>
                    <Button variant="tertiary" onClick={handlePublish}>Publier</Button>
                </div>
            </div>
        </div>
    );
}