// source/src/components/comments/CommentCard.js
import React from 'react';
import { getGravatarUrlSync, formatTimeAgo } from '../../utils/helpers';

const CommentCard = ({ comment, currentUser, onShowMessage, onDelete }) => {
  const { comment_id, creator, createdAt, text, upvotes, downvotes } = comment;
  const isOwnComment = currentUser && currentUser.username === creator;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        // Call delete API here
        onDelete();
      } catch (error) {
        onShowMessage('Failed to delete comment', 'error');
      }
    }
  };

  return (
    <div className="comment-card border-bottom py-2">
      <div className="d-flex">
        <img
          src={getGravatarUrlSync(creator + '@example.com')}
          alt={`${creator} avatar`}
          className="comment-avatar me-2"
          style={{ width: '24px', height: '24px', borderRadius: '50%' }}
        />
        
        <div className="flex-grow-1">
          <div className="comment-content">
            <span className="comment-text">{text}</span>
            <span className="comment-meta text-muted ms-2">
              – <strong>{creator}</strong> {formatTimeAgo(createdAt)}
            </span>
            
            {isOwnComment && (
              <button
                className="btn btn-link btn-sm text-danger p-0 ms-2"
                onClick={handleDelete}
                style={{ fontSize: '0.8em' }}
              >
                delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
