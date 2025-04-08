import React, { useState } from 'react';
import Avatar from '../../../ui/Profile/Avatar';

interface CommentItemProps {
  id: number;
  content: string;
  username: string;
  created_at: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  avatar: string | null;
  is_censored: boolean;
  onCensor: (id: number, isCensored: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = ({
  id,
  content,
  username,
  created_at,
  avatar,
  is_censored,
  onCensor,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateObj: { date: string; timezone_type: number; timezone: string }) => {
    try {
      return new Date(dateObj.date).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
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
              {formatDate(created_at)}
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
      </div>
    </div>
  );
};

export default CommentItem; 