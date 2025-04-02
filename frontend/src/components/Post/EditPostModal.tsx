import React, { useState, useEffect } from 'react';
import TextArea from '../../ui/TextArea/TextArea';
import Button from '../../ui/Button/Button';
import { apiRequest } from '../../lib/api-request';

interface MediaItem {
    url: string;
    type: string;
    id?: number;
}

interface MediaPreview {
    file: File;
    preview: string;
    id: string;
}

interface EditPostModalProps {
    postId: number;
    initialContent: string;
    existingMedia: MediaItem[];
    onClose: () => void;
    onSuccess: () => void;
}

function EditPostModal({
    postId,
    initialContent,
    existingMedia,
    onClose,
    onSuccess
}: EditPostModalProps) {
    const [editContent, setEditContent] = useState(initialContent);
    const [charCount, setCharCount] = useState(initialContent.length);
    const [newMediaFiles, setNewMediaFiles] = useState<MediaPreview[]>([]);
    const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Réinitialiser les états quand le modal s'ouvre
    useEffect(() => {
        setEditContent(initialContent);
        setCharCount(initialContent.length);
        setNewMediaFiles([]);
        setMediaToDelete([]);
        setEditError(null);
    }, [initialContent]);

    // Nettoyer les URLs des prévisualisations lors du démontage du composant
    useEffect(() => {
        return () => {
            newMediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
        };
    }, [newMediaFiles]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= 280) {
            setEditContent(newContent);
            setCharCount(newContent.length);
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                id: crypto.randomUUID()
            }));
            
            setNewMediaFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeNewMedia = (id: string) => {
        setNewMediaFiles(prev => {
            const filtered = prev.filter(media => media.id !== id);
            // Libérer les URL des objets qui ne sont plus utilisés
            const removedMedia = prev.find(media => media.id === id);
            if (removedMedia) {
                URL.revokeObjectURL(removedMedia.preview);
            }
            return filtered;
        });
    };

    const toggleMediaToDelete = (mediaId: number | undefined) => {
        console.log('Toggling media:', mediaId);
        
        if (mediaId === undefined) {
            console.error('Media ID is undefined');
            return;
        }
        
        if (mediaToDelete.includes(mediaId)) {
            console.log('Removing media from delete list:', mediaId);
            setMediaToDelete(prev => prev.filter(id => id !== mediaId));
        } else {
            console.log('Adding media to delete list:', mediaId);
            setMediaToDelete(prev => [...prev, mediaId]);
        }
    };

    const handleSubmitEdit = async () => {
        if (editContent.trim() === '') {
            setEditError('Le contenu ne peut pas être vide');
            return;
        }
        
        setIsSubmitting(true);
        setEditError(null);
        
        try {
            const formData = new FormData();
            formData.append('content', editContent);
            
            // Ajouter les IDs des médias à supprimer
            console.log('Media to delete before sending:', mediaToDelete);
            
            if (mediaToDelete.length > 0) {
                // N'utiliser que la méthode "delete_media[]" pour chaque ID
                mediaToDelete.forEach(mediaId => {
                    formData.append('delete_media[]', mediaId.toString());
                    console.log(`Appending delete_media[] = ${mediaId}`);
                });
            }
            
            // Ajouter les nouveaux médias
            newMediaFiles.forEach(mediaItem => {
                formData.append('media[]', mediaItem.file);
                console.log(`Appending media file: ${mediaItem.file.name}`);
            });
            
            console.log('Sending update for post', postId);
            console.log('Form data entries:');
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }
            
            const response = await apiRequest(`/posts/${postId}`, {
                method: 'POST',
                body: formData,
            });
            
            const responseData = await response.json();
            console.log('Response data:', responseData);
            
            if (!response.ok) {
                console.error('Error response data:', responseData);
                setEditError(responseData.error || 'Une erreur est survenue lors de la modification du post');
            } else {
                onSuccess();
            }
        } catch (error) {
            console.error('Error updating post:', error);
            setEditError('Une erreur est survenue lors de la modification du post');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Rendu pour l'aperçu du média dans l'éditeur
    const renderMediaPreview = (mediaItem: MediaPreview) => {
        if (mediaItem.file.type.startsWith('image')) {
            return <img src={mediaItem.preview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />;
        } else if (mediaItem.file.type.startsWith('video')) {
            return (
                <video className="w-20 h-20 object-cover rounded-md">
                    <source src={mediaItem.preview} type={mediaItem.file.type} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (mediaItem.file.type.startsWith('audio')) {
            return (
                <div className="w-20 h-20 flex items-center justify-center bg-custom-light-gray rounded-md">
                    <audio controls className="w-16">
                        <source src={mediaItem.preview} type={mediaItem.file.type} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 backdrop-blur-sm bg-custom bg-opacity-30">
            <div className="bg-custom-inverse p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-xl mx-4 h-auto max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg md:text-xl font-bold mb-3 text-custom-inverse">Modifier le post</h2>
                
                {editError && (
                    <div className="mb-3 p-2 bg-custom-red bg-opacity-20 text-custom-red rounded-md text-sm">
                        {editError}
                    </div>
                )}
                
                <div className="mb-3">
                    <TextArea
                        className={`text-custom-inverse bg-custom-inverse w-full p-2 border border-custom-gray rounded-md focus:border-custom-blue focus:ring-1 focus:ring-custom-blue overflow-hidden ${charCount === 280 ? 'text-custom-red' : ''}`}
                        variant="primary"
                        placeholder="Contenu du post"
                        value={editContent}
                        onChange={handleContentChange}
                    />
                    <div className={`text-sm ${charCount === 280 ? 'text-custom-red' : 'text-custom-gray'}`}>
                        {charCount}/280
                    </div>
                </div>
                
                {/* Affichage des médias existants */}
                {existingMedia && existingMedia.length > 0 && (
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold mb-2 text-custom-inverse">Médias existants</h3>
                        <div className="flex flex-wrap gap-2">
                            {existingMedia.map((mediaItem, index) => (
                                <div key={index} className="relative">
                                    <div 
                                        className={`w-20 h-20 rounded-md overflow-hidden ${mediaToDelete.includes(mediaItem.id || -1) ? 'opacity-50' : ''}`}
                                    >
                                        {mediaItem.type === 'image' && (
                                            <img src={mediaItem.url} alt="Media" className="w-full h-full object-cover" />
                                        )}
                                        {mediaItem.type === 'video' && (
                                            <div className="w-full h-full bg-custom-light-gray flex items-center justify-center">
                                                <span>🎥</span>
                                            </div>
                                        )}
                                        {mediaItem.type === 'audio' && (
                                            <div className="w-full h-full bg-custom-light-gray flex items-center justify-center">
                                                <span>🎵</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('Media button clicked, id:', mediaItem.id);
                                            toggleMediaToDelete(mediaItem.id);
                                        }}
                                        className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                                            mediaToDelete.includes(mediaItem.id || -1) 
                                            ? 'bg-custom-blue text-custom' 
                                            : 'bg-custom-red text-custom'
                                        }`}
                                    >
                                        {mediaToDelete.includes(mediaItem.id || -1) ? '↻' : '×'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-custom-gray mt-1">
                            Cliquez sur × pour marquer un média à supprimer
                        </p>
                    </div>
                )}
                
                {/* Ajout de nouveaux médias */}
                <div className="mb-3">
                    <h3 className="text-sm font-semibold mb-2 text-custom-inverse">Ajouter des médias</h3>
                    <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleMediaChange}
                        multiple
                        className="block w-full text-sm text-custom-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-custom-blue file:bg-opacity-20 file:text-custom-blue hover:file:bg-opacity-30"
                    />
                </div>
                
                {/* Aperçu des nouveaux médias */}
                {newMediaFiles.length > 0 && (
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold mb-2 text-custom-inverse">Nouveaux médias</h3>
                        <div className="flex flex-wrap gap-2">
                            {newMediaFiles.map(media => (
                                <div key={media.id} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => removeNewMedia(media.id)}
                                        className="absolute top-1 right-1 bg-custom-red text-custom rounded-full w-5 h-5 flex items-center justify-center z-10"
                                    >
                                        ×
                                    </button>
                                    {renderMediaPreview(media)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-3 mt-3">
                    <button
                        className="px-3 py-1.5 text-sm bg-custom-light-gray bg-opacity-30 rounded-md hover:bg-opacity-50 text-custom-inverse"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <Button
                        variant="tertiary"
                        onClick={handleSubmitEdit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Envoi en cours...' : 'Enregistrer'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EditPostModal; 