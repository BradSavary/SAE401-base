import React, { useState } from 'react';
import { apiRequest } from '../../lib/api-request';
import TextArea from '../../ui/TextArea/TextArea';
import Button from '../../ui/Button/Button';

interface CommentFormProps {
  postId: number;
  onCommentAdded: (newComment: any) => void;
  onCancel?: () => void;
}

function CommentForm({ postId, onCommentAdded, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (content.trim() === '') {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest('/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          post_id: postId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onCommentAdded(data.comment);
        setContent('');
        if (onCancel) onCancel();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="comment-form mt-2 pl-2">
      {error && (
        <div className="mb-2 p-1 bg-custom-red bg-opacity-20 text-custom-red rounded-md text-xs">
          {error}
        </div>
      )}
      <TextArea
        className="text-custom bg-custom w-full p-2 border border-custom-gray rounded-md focus:border-custom-blue focus:ring-1 focus:ring-custom-blue overflow-hidden text-sm"
        variant="primary"
        placeholder="Votre réponse..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <button
            className="px-2 py-1 text-xs bg-custom-inverse bg-opacity-30 rounded-md hover:bg-opacity-50 text-custom-inverse cursor-pointer"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <Button
          variant="tertiary"
          className="px-2 py-1 text-xs"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Comment'}
        </Button>
      </div>
      <div className="text-xs text-custom-gray my-1">
        Tips: Press Ctrl+Enter to publish quickly
      </div>
    </div>
  );
}

export default CommentForm; 