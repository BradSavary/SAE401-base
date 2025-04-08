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
    error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB en bytes

export function Write() {
    const [content, setContent] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
    const [error, setError] = useState<string | null>(null);
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

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Réduire la taille si nécessaire
                    if (width > 1920) {
                        height = (1920 * height) / width;
                        width = 1920;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        const newMediaFiles: MediaPreview[] = [];

        for (const file of Array.from(files)) {
            if (file.size > MAX_FILE_SIZE) {
                setError(`Le fichier ${file.name} est trop volumineux. Taille maximale: 50MB`);
                continue;
            }

            try {
                const compressedFile = await compressImage(file);
                newMediaFiles.push({
                    file: compressedFile,
                    preview: URL.createObjectURL(compressedFile),
                    id: crypto.randomUUID()
                });
            } catch (err) {
                setError(`Erreur lors du traitement du fichier ${file.name}`);
                console.error('Error processing file:', err);
            }
        }

        setMediaFiles(prev => [...prev, ...newMediaFiles]);
    };

    const removeMedia = (id: string) => {
        setMediaFiles(prev => {
            const filtered = prev.filter(media => media.id !== id);
            const removedMedia = prev.find(media => media.id === id);
            if (removedMedia) {
                URL.revokeObjectURL(removedMedia.preview);
            }
            return filtered;
        });
    };

    const handlePublish = async () => {
        if (mediaFiles.some(media => media.error)) {
            setError('Veuillez corriger les erreurs avant de publier');
            return;
        }

        try {
            const userId = user_id ? parseInt(user_id, 10) : null;
            const formData = new FormData();
            formData.append('content', content);
            
            mediaFiles.forEach(mediaItem => {
                formData.append('media[]', mediaItem.file);
            });
            
            formData.append('user_id', String(userId));

            const response = await apiRequest('/posts', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la publication du post');
            }

            navigate('/feed');
        } catch (error) {
            console.error('Error publishing post:', error);
            setError(error instanceof Error ? error.message : 'Erreur lors de la publication du post');
        }
    };

    React.useEffect(() => {
        return () => {
            mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
        };
    }, [mediaFiles]);

    const renderPreview = (media: MediaPreview) => {
        if (media.error) {
            return (
                <div className="w-28 h-28 flex items-center justify-center bg-red-100 rounded-md">
                    <p className="text-red-500 text-xs text-center">{media.error}</p>
                </div>
            );
        }

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
                
                {error && (
                    <div className="text-red-500 text-sm mt-2">
                        {error}
                    </div>
                )}
                
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
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                    </div>
                    <div className={` ${charCount === 280 ? 'text-red-500' : 'text-gray-500'}`}>{charCount}/280</div>
                    <Button variant="tertiary" onClick={handlePublish}>Publier</Button>
                </div>
            </div>
        </div>
    );
}