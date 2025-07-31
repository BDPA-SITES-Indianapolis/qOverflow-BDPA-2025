// source/src/components/comments/CommentSection.js
import React, { useState, useEffect } from 'react';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { getComments } from '../../services/comments';

const CommentSection = ({ 
  parentType, // 'question' or 'answer'
  parentId, 
  questionId, // needed for answer comments
  currentUser, 
  canComment, 
  onShowMessage 
}) => {
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const response = await getComments(parentType, parentId, questionId);
        
        if (response.success) {
          // Sort comments by creation time (oldest first)
          const sortedComments = (response.comments || []).sort((a, b) => 
            a.createdAt - b.createdAt
          );
          setComments(sortedComments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        // Show sample comments for development
        setComments(getSampleComments());
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [parentType, parentId, questionId]);

  const getSampleComments = () => [
    {
      comment_id: '1',
      creator: 'helper123',
      createdAt: Date.now() - 1800000, // 30 min ago
      text: 'Have you tried checking the documentation?',
      upvotes: 1,
      downvotes: 0
    }
  ];

  const handleNewComment = (newComment) => {
    setComments(prev => [...prev, newComment]);
    setShowCommentForm(false);
    onShowMessage('Comment added successfully!', 'success');
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(comment => comment.comment_id !== commentId));
    onShowMessage('Comment deleted', 'info');
  };

  return (
    <div className="comment-section">
      {/* Loading Comments */}
      {isLoading && (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm text-muted" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </div>
        </div>
      )}

      {/* Comments List */}
      {!isLoading && comments.length > 0 && (
        <div className="comments-list border-top pt-2">
          {comments.map(comment => (
            <CommentCard
              key={comment.comment_id}
              comment={comment}
              currentUser={currentUser}
              onShowMessage={onShowMessage}
              onDelete={() => handleDeleteComment(comment.comment_id)}
            />
          ))}
        </div>
      )}

      {/* Add Comment Section */}
      <div className="add-comment-section mt-2">
        {!showCommentForm ? (
          <button
            className="btn btn-link btn-sm text-muted p-0"
            onClick={() => setShowCommentForm(true)}
            disabled={!canComment}
          >
            {!currentUser ? 'Log in to comment' :
             !canComment ? 'Need Level 3 to comment' :
             'Add a comment'}
          </button>
        ) : (
          <CommentForm
            parentType={parentType}
            parentId={parentId}
            questionId={questionId}
            currentUser={currentUser}
            onShowMessage={onShowMessage}
            onCancel={() => setShowCommentForm(false)}
            onSuccess={handleNewComment}
          />
        )}
      </div>
    </div>
  );
};

export default CommentSection;