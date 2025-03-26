import React, { JSX, useState } from 'react';
import { timeAgo } from '../../lib/utils';
import { DotsIcon } from '../../ui/Icon/3dots';
import { apiRequest } from '../../lib/api-request';

interface PostProps {
  username: string;
  content: string;
  date: string;
  avatar?: string;
  user_id: number;
  post_id: number; // Ajout de l'ID du post
  onDelete: (postId: number) => void; // Callback pour informer le parent
}

function Post({ username, content, date, avatar, user_id, post_id, onDelete }: PostProps): JSX.Element {
  const [showPopup, setShowPopup] = useState(false);

  const connectedUserId = Number(localStorage.getItem('user_id'));

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const deletePost = async () => {
    try {
        const response = await apiRequest(`/posts/${post_id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            onDelete(post_id); // Informer le parent que le post a été supprimé
        } else {
            console.error('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
};

  return (
    <div className='flex flex-row w-full'>
      <img 
        src={avatar ? `${avatar}` : "../../../public/default-avata.webp"} 
        className='rounded-full max-w-8 max-h-8 mt-4 ml-2 aspect-square' 
        alt="Post image" 
      />
      <div className="p-4 border-b border-custom-gray w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold mr-2 text-custom">{username}</span>
          <div className='flex items-center gap-2 relative'>
            <span className="text-custom-light-gray text-sm">{date}</span>
            <DotsIcon className="w-4 h-4 cursor-pointer" alt="3 dots" onClick={togglePopup} />
            {showPopup && (
              <div className="absolute top-8 right-0 bg-white shadow-md rounded-md p-2 z-10">
                {connectedUserId === user_id ? (
                  <>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Edit
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={deletePost}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-gray-800 text-custom-light-gray max-w-full">
          {content}
        </div>
      </div>
    </div>
  );
}

export { Post };