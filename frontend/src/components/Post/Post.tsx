import React, { JSX } from 'react';

interface PostProps {
  username: string;
  content: string;
  date: string;
}

function Post({ username, content, date }: PostProps): JSX.Element {
  return (
    <div className=" p-4 border-b border-gray-200 w-full" >
      <div className=" flex items-center justify-between mb-2">
        <span className=" font-bold mr-2 text-custom">{username}</span>
        <span className=" text-custom-light-gray text-sm ">{date}</span>
      </div>
      <div className=" text-gray-800 text-custom-light-gray">
        {content}
      </div>
    </div>
  );
}; 
export { Post };