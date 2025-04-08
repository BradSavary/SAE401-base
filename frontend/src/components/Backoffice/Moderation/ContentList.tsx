import React from 'react';
import PostItem from './PostItem';
import CommentItem from './CommentItem';

interface ContentListProps {
  items: any[];
  type: 'posts' | 'comments';
  onCensor: (id: number, isCensored: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ContentList: React.FC<ContentListProps> = ({ items, type, onCensor, onDelete }) => {
  if (items.length === 0) {
    return <div className="text-center text-custom-light-gray">No content found</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-custom-dark-gray p-4 rounded-lg">
          {type === 'posts' ? (
            <PostItem
              id={item.id}
              content={item.content}
              username={item.username}
              created_at={item.created_at}
              avatar={item.avatar}
              is_censored={item.is_censored}
              media={item.media}
              onCensor={onCensor}
              onDelete={onDelete}
            />
          ) : (
            <CommentItem
              id={item.id}
              content={item.content}
              username={item.user ? item.user.username : item.username}
              created_at={item.created_at}
              avatar={item.user ? item.user.avatar : item.avatar}
              is_censored={item.is_censored}
              onCensor={onCensor}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ContentList; 