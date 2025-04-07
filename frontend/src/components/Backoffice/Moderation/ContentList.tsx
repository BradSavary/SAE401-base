import React from 'react';
import PostItem from './PostItem';
import CommentItem from './CommentItem';

interface ContentListProps {
  items: any[];
  type: 'posts' | 'comments';
  onCensor: (id: number, isCensored: boolean) => void;
}

const ContentList: React.FC<ContentListProps> = ({ items, type, onCensor }) => {
  if (items.length === 0) {
    return <div className="text-center text-custom-light-gray">No content found</div>;
  }

  return (
    <div className="space-y-4">
      {type === 'posts' 
        ? items.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              onCensor={onCensor} 
            />
          ))
        : items.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onCensor={onCensor} 
            />
          ))
      }
    </div>
  );
};

export default ContentList; 