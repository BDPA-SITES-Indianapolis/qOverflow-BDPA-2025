// source/src/components/comments/CommentCard.js
import React, { useState } from 'react';
import { getGravatarUrlSync, formatTimeAgo } from '../../utils/helpers';
import { voteOnComment } from '../../services/comments-vote';


const CommentCard = ({ comment, currentUser, onShowMessage, onDelete, parentType, parentId, questionId }) => {
  const { comment_id, creator, createdAt, text, upvotes, downvotes, userVote } = comment;
  const isOwnComment = currentUser && currentUser.username === creator;
  const [vote, setVote] = useState(userVote || null); // 'upvote', 'downvote', or null
  const [up, setUp] = useState(upvotes || 0);
  const [down, setDown] = useState(downvotes || 0);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType) => {
    if (!currentUser) {
      onShowMessage('Please log in to vote', 'error');
      return;
    }
    setLoading(true);
    try {
      let newVote = vote;
      if (vote === voteType) {
        // Unvote
        await voteOnComment(parentType, parentId, questionId, comment_id, 'unvote');
        if (voteType === 'upvote') setUp(up - 1);
        if (voteType === 'downvote') setDown(down - 1);
        setVote(null);
        onShowMessage('Vote removed', 'info');
      } else {
        await voteOnComment(parentType, parentId, questionId, comment_id, voteType);
        if (voteType === 'upvote') {
          setUp(vote === 'downvote' ? up + 1 : up + 1);
          if (vote === 'downvote') setDown(down - 1);
        } else {
          setDown(vote === 'upvote' ? down + 1 : down + 1);
          if (vote === 'upvote') setUp(up - 1);
        }
        setVote(voteType);
        onShowMessage(voteType === 'upvote' ? 'Upvoted' : 'Downvoted', 'success');
      }
    } catch (error) {
      onShowMessage('Failed to vote', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        onDelete();
      } catch (error) {
        onShowMessage('Failed to delete comment', 'error');
      }
    }
  };

  return (
    <div className="comment-card border-bottom py-2">
      <div className="d-flex align-items-center">
        <img
          src={getGravatarUrlSync(creator + '@example.com')}
          alt={`${creator} avatar`}
          className="comment-avatar me-2"
          style={{ width: '24px', height: '24px', borderRadius: '50%' }}
        />
        <div className="flex-grow-1">
          <div className="comment-content d-flex align-items-center">
            <span className="comment-text">{text}</span>
            <span className="comment-meta text-muted ms-2">
              – <strong>{creator}</strong> {formatTimeAgo(createdAt)}
            </span>
            {/* Voting buttons */}
            <button
              className={`btn btn-link btn-sm p-0 ms-2 ${vote === 'upvote' ? 'text-success' : 'text-muted'}`}
              onClick={() => handleVote('upvote')}
              disabled={loading}
              title={vote === 'upvote' ? 'Remove upvote' : 'Upvote'}
              style={{ fontSize: '0.9em' }}
            >
              ▲ {up}
            </button>
            <button
              className={`btn btn-link btn-sm p-0 ms-1 ${vote === 'downvote' ? 'text-danger' : 'text-muted'}`}
              onClick={() => handleVote('downvote')}
              disabled={loading}
              title={vote === 'downvote' ? 'Remove downvote' : 'Downvote'}
              style={{ fontSize: '0.9em' }}
            >
              ▼ {down}
            </button>
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