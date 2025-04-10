import React from 'react';

interface PostItemProps {
  post: {
    id: number;
    content: string;
    username: string;
    created_at: {
      date: string;
    };
    avatar: string | null;
    is_censored: boolean;
    media?: Array<{
      id: number;
      url: string;
      type: string;
    }>;
  };
  onCensor: (id: number, isCensored: boolean) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onCensor }) => {
  const { id, content, username, created_at, avatar, is_censored, media } = post;
  const defaultAvatar = '/default-avata.webp';
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };
  
  const toggleCensor = () => {
    onCensor(id, !is_censored);
  };
  
  const renderMedia = () => {
    if (!media || media.length === 0) return null;
    
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {media.map(item => (
          <div key={item.id} className="relative">
            {item.type === 'image' && (
              <img 
                src={item.url} 
                alt="Post media" 
                className="max-h-48 rounded object-cover" 
              />
            )}
            {item.type === 'video' && (
              <video 
                src={item.url} 
                controls 
                className="max-h-48 rounded"
              />
            )}
            {item.type === 'audio' && (
              <audio 
                src={item.url} 
                controls 
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`p-4 rounded-lg ${is_censored ? 'bg-red-900/20' : 'bg-custom-dark-gray'}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={avatar || defaultAvatar} 
          alt={`${username}'s avatar`} 
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-white">{username}</p>
              <p className="text-xs text-custom-light-gray">{formatDate(created_at.date)}</p>
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
          
          {renderMedia()}
        </div>
      </div>
      
      {is_censored && (
        <div className="mt-2 text-sm text-yellow-400 italic">
          This content has been censored and is no longer visible to users.
        </div>
      )}
    </div>
  );
};

export default PostItem; 