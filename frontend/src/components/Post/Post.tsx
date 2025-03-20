import React, { JSX } from 'react';

interface PostProps {
  username: string;
  content: string;
  date: string;
}

function Post({ username, content, date }: PostProps): JSX.Element {
  return (
    <div className='flex flex-row w-full'>
      <img src="https://avatar.iran.liara.run/public" className='rounded-full max-w-8 max-h-8 mt-4 ml-2' alt="Post image" />
      <div className="p-4 border-b border-custom-light-gray w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold mr-2 text-custom">{username}</span>
        <span className="text-custom-light-gray text-sm">{date}</span>
      </div>
      <div className="text-gray-800 text-custom-light-gray max-w-full">
        {content}
      </div>
      </div>
    </div>
  );
}; 
export { Post };