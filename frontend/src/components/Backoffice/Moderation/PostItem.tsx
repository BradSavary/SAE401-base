import React, { useState } from 'react';
import Avatar from '../../../ui/Profile/Avatar';

interface MediaItem {
  id: number;
  url: string;
  type: string;
}

interface PostItemProps {
  id: number;
  content: string;
  username: string;
  created_at: string;
  avatar: string | null;
  is_censored: boolean;
  media?: MediaItem[];
  onCensor: (id: number, isCensored: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const PostItem: React.FC<PostItemProps> = ({
  id,
  content,
  username,
  created_at,
  avatar,
  is_censored,
  media,
  onCensor,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting post:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const renderMedia = (mediaItem: MediaItem) => {
    switch (mediaItem.type) {
      case 'image':
        return (
          <img
            key={mediaItem.id}
            src={mediaItem.url}
            alt="Post media"
            className="max-w-full h-auto rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            key={mediaItem.id}
            src={mediaItem.url}
            controls
            className="max-w-full h-auto rounded-lg"
          />
        );
      case 'audio':
        return (
          <audio
            key={mediaItem.id}
            src={mediaItem.url}
            controls
            className="w-full"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            avatar={avatar}
            className="w-10 h-10"
          />
          <div>
            <p className="font-medium text-custom-light-gray">{username}</p>
            <p className="text-sm text-custom-light-gray">
              {new Date(created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onCensor(id, !is_censored)}
            className={`px-3 py-1 rounded ${
              is_censored
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            } text-white`}
          >
            {is_censored ? 'Uncensor' : 'Censor'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      <div className={`${is_censored ? 'opacity-50' : ''}`}>
        <p className="text-custom-light-gray">{content}</p>
        {media && media.length > 0 && (
          <div className="mt-2 space-y-2">
            {media.map(renderMedia)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem; 