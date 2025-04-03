import React, { useEffect, useState } from 'react';
import Comment from './Comment';
import { checkBlockStatus } from '../../lib/block-service';

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
  is_censored: boolean;
}

interface FilteredCommentData extends CommentData {
  isAdminBlocked?: boolean;
  isUserBlockedOrBlocking?: boolean;
  localIndex?: number;
}

interface CommentListProps {
  comments: CommentData[];
  onDeleteComment: (commentId: number) => void;
  onUpdateComment: (commentId: number, newContent: string) => void;
}

function CommentList({ comments, onDeleteComment, onUpdateComment }: CommentListProps) {
  const [filteredComments, setFilteredComments] = useState<FilteredCommentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBlockStatuses() {
      setLoading(true);
      
      if (!comments || comments.length === 0) {
        setFilteredComments([]);
        setLoading(false);
        return;
      }
      
      const commentWithBlockStatus = await Promise.all(
        comments.map(async (comment, index) => {
          try {
            if (!comment.user || !comment.user.id) {
              console.error('Invalid comment data:', comment);
              return null;
            }
            
            const blockStatus = await checkBlockStatus(comment.user.id);
            return {
              ...comment,
              isAdminBlocked: comment.user.is_blocked || false,
              isUserBlockedOrBlocking: blockStatus.is_blocked || blockStatus.is_blocked_by || false,
              localIndex: index
            };
          } catch (error) {
            console.error(`Error checking block status for user ${comment.user?.id}:`, error);
            return {
              ...comment,
              isAdminBlocked: comment.user?.is_blocked || false,
              isUserBlockedOrBlocking: false,
              localIndex: index
            };
          }
        })
      );
      
      const validComments = commentWithBlockStatus.filter(comment => comment !== null) as FilteredCommentData[];
      
      setFilteredComments(validComments);
      setLoading(false);
    }
    
    checkBlockStatuses();
  }, [comments]);

  if (loading) {
    return <div className="text-custom-light-gray text-center py-2">Chargement des commentaires...</div>;
  }

  if (filteredComments.length === 0) {
    return null;
  }

  return (
    <div className="comment-list border-t border-custom-gray mt-1">
      {filteredComments.map((comment) => {
        const uniqueKey = `comment-${comment.id}-${comment.localIndex}`;
        
        if (comment.isAdminBlocked) {
          return (
            <div key={uniqueKey} className="p-2 text-custom-light-gray text-sm italic">
              Ce commentaire n'est pas disponible car l'auteur a été bloqué par l'administration.
            </div>
          );
        }
        
        if (comment.isUserBlockedOrBlocking) {
          return (
            <div key={uniqueKey} className="p-2 text-custom-light-gray text-sm italic">
              Ce commentaire n'est pas disponible car vous avez bloqué l'auteur ou l'auteur vous a bloqué.
            </div>
          );
        }
        
        return (
          <Comment
            key={uniqueKey}
            id={comment.id}
            content={comment.content}
            created_at={comment.created_at}
            user={comment.user}
            post_id={comment.post_id}
            is_censored={comment.is_censored}
            onDelete={onDeleteComment}
            onUpdate={onUpdateComment}
          />
        );
      })}
    </div>
  );
}

export default CommentList; 