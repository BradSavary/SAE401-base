import React, { JSX, useState, useEffect } from 'react';
import { DotsIcon } from '../../ui/Icon/3dots';
import { apiRequest } from '../../lib/api-request';
import { LikeIcon } from '../../ui/NavBarIcon/like';
import { LikeIcon as LikeSIcon } from '../../ui/NavBarIcon/likeS';

interface PostProps {
  username: string;
  content: string;
  date: string;
  avatar?: string;
  user_id: number;
  post_id: number;
  onDelete: (postId: number) => void;
  userLiked: boolean;
}

function Post({ username, content, date, avatar, user_id, post_id, onDelete, userLiked }: PostProps): JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [liked, setLiked] = useState(userLiked);
  const [likeCount, setLikeCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false); // État pour afficher la confirmation

  const connectedUserId = Number(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await apiRequest(`/post/like/${post_id}`, { method: 'GET' });
        const data = await response.json();
        setLikeCount(data.likes);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [post_id]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const confirmDelete = async () => {
    try {
      const response = await apiRequest(`/posts/${post_id}`, { method: 'DELETE' });

      if (response.ok) {
        onDelete(post_id);
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setShowConfirm(false); // Fermer la confirmation après suppression
    }
  };

  const handleLike = async () => {
    try {
      const response = await apiRequest(`/post/like/${post_id}`, {
        method: liked ? 'DELETE' : 'POST',
        body: JSON.stringify({ user_id: connectedUserId }),
      });

      if (response.ok) {
        setLiked(!liked);
        setLikeCount(prev => (liked ? prev - 1 : prev + 1));
      } else {
        console.error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
                      onClick={() => setShowConfirm(true)} // Afficher la confirmation
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
        <div className="flex items-center mt-2">
          <button onClick={handleLike} className="flex items-center gap-1 cursor-pointer">
            {liked ? (
              <LikeSIcon className="w-6 h-6 text-red-500" alt="Liked" />
            ) : (
              <LikeIcon className="w-5 h-5 text-gray-500" alt="Like" />
            )}
            <span className="text-sm text-gray-700">{likeCount}</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg mb-4">Are you sure you want to delete this post?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowConfirm(false)} // Annuler
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmDelete} // Confirmer la suppression
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { Post };