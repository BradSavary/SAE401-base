import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api-request';
import Button from "../../ui/Button/Button";
import TextArea from "../../ui/TextArea/TextArea";
import Card from '../../ui/Card/Card';
import Badge from '../../ui/Badge/Badge';

interface MediaPreview {
    file: File;
    preview: string;
    id: string;
    error?: string;
}

interface PostFormProps {
    defaultContent?: string;
    onSuccess?: (postId?: number) => void;
    onError?: (message: string) => void;
    className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB en bytes
const MAX_CHARS = 280;

const PostForm: React.FC<PostFormProps> = ({
    defaultContent = '',
    onSuccess,
    onError,
    className = ''
}) => {
    const [content, setContent] = useState(defaultContent);
    const [charCount, setCharCount] = useState(defaultContent.length);
    const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const username = localStorage.getItem('username');
    const user_id = localStorage.getItem('user_id');

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= MAX_CHARS) {
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
        if (!content.trim() && mediaFiles.length === 0) {
            setError('Veuillez ajouter du contenu ou des médias à votre post');
            return;
        }

        if (mediaFiles.some(media => media.error)) {
            setError('Veuillez corriger les erreurs avant de publier');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const userId = user_id ? parseInt(user_id, 10) : null;
            if (!userId) {
                throw new Error('Utilisateur non connecté');
            }

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

            const data = await response.json();
            setContent('');
            setCharCount(0);
            setMediaFiles([]);
            
            if (onSuccess) {
                onSuccess(data.post?.id);
            }
        } catch (error) {
            console.error('Error publishing post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la publication du post';
            setError(errorMessage);
            
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup URL objects on unmount
    useEffect(() => {
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
        <div className={`flex flex-col ${className}`}>
            <Card variant="primary" padding="md" width="full">
                <div className="w-full flex flex-col justify-center space-y-4">
                    <h2 className="text-custom font-bold">{username}</h2>
                    <div>
                        <TextArea
                            className={`${charCount === MAX_CHARS ? 'text-red-500' : 'text-custom'}`}
                            variant="primary"
                            placeholder="Start a thread"
                            value={content}
                            onChange={handleContentChange}
                        />
                    </div>
                    
                    {error && (
                        <Badge variant="danger" size="md">{error}</Badge>
                    )}
                    
                    {mediaFiles.length > 0 && (
                        <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                                {mediaFiles.map(media => (
                                    <div key={media.id} className="relative">
                                        <Button
                                            variant="quaternary"
                                            onClick={() => removeMedia(media.id)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10 p-0"
                                        >
                                            &times;
                                        </Button>
                                        {renderPreview(media)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            
            <div className="flex gap-4 justify-between items-center mt-4 absolute bottom-0 left-0 right-0 mb-18 mx-4">
                <div>
                    <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleMediaChange}
                        multiple
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Badge 
                        variant={charCount === MAX_CHARS ? "danger" : "secondary"} 
                        size="md"
                    >
                        {charCount}/{MAX_CHARS}
                    </Badge>
                    <Button 
                        variant="tertiary" 
                        onClick={handlePublish}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Publication...' : 'Publier'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PostForm; 