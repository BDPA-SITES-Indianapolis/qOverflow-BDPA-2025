// source/src/components/comments/CommentForm.js
import React, { useState } from 'react';
import { createComment } from '../../services/comments';

const CommentForm = ({ 
  parentType, 
  parentId, 
  questionId, 
  currentUser, 
  onShowMessage, 
  onCancel,
  onSuccess 
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      onShowMessage('Comment cannot be empty', 'error');
      return;
    }

    if (commentText.length > 150) {
      onShowMessage('Comment must be 150 characters or less', 'error');
      return;
    }

    if (!currentUser) {
      onShowMessage('Please log in to comment', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createComment(parentType, parentId, questionId, {
        creator: currentUser.username,
        text: commentText.trim()
      });

      if (response.success) {
        const newComment = {
          comment_id: response.comment.comment_id,
          creator: currentUser.username,
          createdAt: Date.now(),
          text: commentText.trim(),
          upvotes: 0,
          downvotes: 0,
          ...response.comment
        };

        if (onSuccess) {
          onSuccess(newComment);
        }
        setCommentText('');
      } else {
        onShowMessage('Failed to post comment', 'error');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      onShowMessage('Failed to post comment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="d-flex gap-2 align-items-start">
        <input
          type="text"
          className="form-control form-control-sm"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          maxLength={150}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitting || !commentText.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
      <small className="text-muted">
        {commentText.length}/150 characters
      </small>
    </form>
  );
};

export default CommentForm;