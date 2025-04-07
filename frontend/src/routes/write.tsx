import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from '../lib/api-request';
import Button from "../ui/Button/Button";
import TextArea from "../ui/TextArea/TextArea";
import { CloseIcon } from "../ui/Icon/close";

interface MediaPreview {
    file: File;
    preview: string;
    id: string;
}

export function Write() {
    const [content, setContent] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]); // État pour les fichiers médias
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
        const files = e.target.files;
        if (files && files.length > 0) {
            const newMediaFiles = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                id: crypto.randomUUID()
            }));
            
            setMediaFiles(prev => [...prev, ...newMediaFiles]);
        }
    };

    const removeMedia = (id: string) => {
        setMediaFiles(prev => {
            const filtered = prev.filter(media => media.id !== id);
            // Libérer les URL des objets qui ne sont plus utilisés
            const removedMedia = prev.find(media => media.id === id);
            if (removedMedia) {
                URL.revokeObjectURL(removedMedia.preview);
            }
            return filtered;
        });
    };

    const handlePublish = async () => {
        try {
            const userId = user_id ? parseInt(user_id, 10) : null;
            const formData = new FormData();
            formData.append('content', content);
            
            // Ajouter tous les fichiers médias
            mediaFiles.forEach(mediaItem => {
                formData.append('media[]', mediaItem.file);
            });
            
            formData.append('user_id', String(userId));

            const response = await apiRequest('/posts', {
                method: 'POST',
                body: formData, // Envoie les données sous forme de FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to publish post: ${errorData.error || 'Please try again.'}`);
            } else {
                alert('Post published successfully!');
                navigate('/feed');
            }
        } catch (error) {
            console.error('Error publishing post:', error);
            alert('Failed to publish post. Please try again.');
        }
    };

    // Nettoyer les URLs des prévisualisations lors du démontage du composant
    React.useEffect(() => {
        return () => {
            mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
        };
    }, []);

    const renderPreview = (media: MediaPreview) => {
        if (media.file.type.startsWith('image')) {
            return <img src={media.preview} alt="Preview" className="w-28 h-28 object-cover rounded-md" />;
        } else if (media.file.type.startsWith('video')) {
            return (
                <video className="w-28 h-28 object-cover rounded-md">
                    <source src={media.preview} type={media.file.type} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (media.file.type.startsWith('audio')) {
            return (
                <div className="w-28 h-28 flex items-center justify-center bg-gray-200 rounded-md">
                    <audio controls className="w-24">
                        <source src={media.preview} type={media.file.type} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        }
        return null;
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
                
                {mediaFiles.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {mediaFiles.map(media => (
                                <div key={media.id} className="relative">
                                    <button
                                        onClick={() => removeMedia(media.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                                        aria-label="Remove media"
                                    >
                                        &times;
                                    </button>
                                    {renderPreview(media)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex gap-4 justify-center items-center absolute bottom-0 right-0 mr-6 mb-22">
                    <div>
                        <input
                            type="file"
                            accept="image/*,video/*,audio/*"
                            onChange={handleMediaChange}
                            multiple
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