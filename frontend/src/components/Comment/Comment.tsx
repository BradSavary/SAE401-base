import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DotsIcon } from '../../ui/Icon/3dots';
import { apiRequest } from '../../lib/api-request';
import TextArea from '../../ui/TextArea/TextArea';
import Button from '../../ui/Button/Button';

interface CommentUserInfo {
  id: number;
  username: string;
  avatar: string | null;
  is_blocked: boolean;
}

interface CommentProps {
  id: number;
  content: string;
  created_at: { date: string; timezone_type: number; timezone: string };
  user: CommentUserInfo;
  post_id: number;
  onDelete: (commentId: number) => void;
  onUpdate: (commentId: number, newContent: string) => void;
}

function Comment({ id, content, created_at, user, post_id, onDelete, onUpdate }: CommentProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectedUserId = Number(localStorage.getItem('user_id'));
  const isCurrentUser = connectedUserId === user.id;

  const handleDelete = async () => {
    try {
      const response = await apiRequest(`/comments/${id}`, { method: 'DELETE' });
      if (response.ok) {
        onDelete(id);
      } else {
        setError("Erreur lors de la suppression du commentaire");
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError("Erreur lors de la suppression du commentaire");
    } finally {
      setShowConfirm(false);
    }
  };

  const handleUpdate = async () => {
    if (editContent.trim() === '') {
      setError("Le contenu ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest(`/comments/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        onUpdate(id, editContent);
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la mise à jour du commentaire");
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setError("Erreur lors de la mise à jour du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(content);
    }
  };

  return (
    <div className="flex flex-row w-full py-2 px-2 border-t border-custom-gray bg-custom bg-opacity-20">
      <Link to={`/profile/${user.username}`} className="flex-shrink-0">
        <img
          src={user.avatar || '../../../public/default-avata.webp'}
          className="rounded-full max-w-7 max-h-7 mt-1 ml-1 aspect-square"
          alt="User avatar"
        />
      </Link>
      <div className="pl-2 w-full relative">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/profile/${user.username}`} className="font-semibold text-sm text-custom hover:underline mr-2">
              {user.username}
            </Link>
            <span className="text-custom-light-gray text-xs">
              {new Date(created_at.date).toLocaleString(undefined, { 
                year: '2-digit', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          {isCurrentUser && (
            <div className="relative">
              <DotsIcon
                className="w-3 h-3 cursor-pointer text-custom-light-gray"
                alt="Options"
                onClick={() => setShowOptions(!showOptions)}
              />
              {showOptions && (
                <div className="absolute top-5 right-0 bg-custom-inverse shadow-md rounded-md p-1 z-20">
                  <button
                    className="block w-full text-left px-3 py-1 text-xs text-custom-blue hover:bg-custom-light-gray hover:bg-opacity-20 cursor-pointer rounded whitespace-nowrap"
                    onClick={() => {
                      setShowOptions(false);
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block bg-custom-inverse w-full text-left px-3 py-1 text-xs text-custom-red  hover:bg-opacity-20 cursor-pointer rounded whitespace-nowrap"
                    onClick={() => {
                      setShowOptions(false);
                      setShowConfirm(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1">
            {error && (
              <div className="mb-2 p-1 bg-custom-red bg-opacity-20 text-custom-red rounded-md text-xs">
                {error}
              </div>
            )}
            <TextArea
              className="text-custom bg-custom w-full p-2 border border-custom-gray rounded-md focus:border-custom-blue focus:ring-1 focus:ring-custom-blue overflow-hidden text-sm"
              variant="primary"
              placeholder="Votre commentaire"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-2 py-1 text-xs bg-custom-inverse bg-opacity-30 rounded-md hover:bg-opacity-50 text-custom-inverse cursor-pointer"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(content);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <Button
                variant="tertiary"
                className="px-2 py-1 text-xs"
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Comment'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-custom-light-gray text-sm break-words mt-1">
            {content}
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-30 backdrop-blur-sm bg-custom bg-opacity-30">
            <div className="bg-custom-inverse p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm mx-4">
              <p className="mb-4 text-custom-inverse text-sm">
                Êtes-vous sûr de vouloir supprimer ce commentaire ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-3 py-1.5 text-sm bg-custom-light-gray bg-opacity-30 rounded-md hover:bg-opacity-50 text-custom-inverse"
                  onClick={() => setShowConfirm(false)}
                >
                  Annuler
                </button>
                <button
                  className="px-3 py-1.5 text-sm bg-custom-red text-custom rounded-md hover:bg-opacity-90"
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment; 