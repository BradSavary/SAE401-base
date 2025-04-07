import React from 'react';

interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    user?: {
      id: number;
      username: string;
      avatar: string | null;
    };
    created_at: {
      date: string;
    };
    post_id: number;
    is_censored: boolean;
  };
  onCensor: (id: number, isCensored: boolean) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onCensor }) => {
  const { id, content, user, created_at, post_id, is_censored } = comment;
  const defaultAvatar = '/default-avatar.webp';
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };
  
  const toggleCensor = () => {
    onCensor(id, !is_censored);
  };
  
  // Default values for user in case it's undefined
  const username = user?.username || 'Unknown User';
  const userAvatar = user?.avatar || defaultAvatar;
  
  return (
    <div className={`p-4 rounded-lg ${is_censored ? 'bg-red-900/20' : 'bg-custom-dark-gray'}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={userAvatar} 
          alt={`${username}'s avatar`} 
          className="w-8 h-8 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-white">{username}</p>
              <p className="text-xs text-custom-light-gray">{formatDate(created_at.date)}</p>
              <p className="text-xs text-custom-light-gray">Comment on post #{post_id}</p>
            </div>
            
            <button
              onClick={toggleCensor}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                is_censored
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {is_censored ? 'Restore' : 'Censor'}
            </button>
          </div>
          
          <div className={`p-3 rounded ${is_censored ? 'bg-red-900/10 text-gray-400 italic' : 'text-white'}`}>
            {content}
          </div>
        </div>
      </div>
      
      {is_censored && (
        <div className="mt-2 text-sm text-yellow-400 italic">
          This comment has been censored and is no longer visible to users.
        </div>
      )}
    </div>
  );
};

export default CommentItem; 