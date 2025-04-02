import React from 'react';
import Comment from './Comment';

interface CommentUserInfo {
  id: number;
  username: string;
  avatar: string | null;
  is_blocked: boolean;
}

interface CommentData {
  id: number;
  content: string;
  created_at: { date: string; timezone_type: number; timezone: string };
  user: CommentUserInfo;
  post_id: number;
}

interface CommentListProps {
  comments: CommentData[];
  onDeleteComment: (commentId: number) => void;
  onUpdateComment: (commentId: number, newContent: string) => void;
}

function CommentList({ comments, onDeleteComment, onUpdateComment }: CommentListProps) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="comment-list border-t border-custom-gray mt-1">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          id={comment.id}
          content={comment.content}
          created_at={comment.created_at}
          user={comment.user}
          post_id={comment.post_id}
          onDelete={onDeleteComment}
          onUpdate={onUpdateComment}
        />
      ))}
    </div>
  );
}

export default CommentList; 