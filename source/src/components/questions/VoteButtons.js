// source/src/components/questions/VoteButtons.js
import React, { useState } from 'react';
import { voteOnQuestion, voteOnAnswer } from '../../services/questions';
import { getUserLevel } from '../../utils/helpers';

const VoteButtons = ({ 
  itemType, 
  itemId, 
  upvotes, 
  downvotes, 
  currentUser, 
  onShowMessage 
}) => {
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
  const [userVote, setUserVote] = useState(null); // 'upvoted', 'downvoted', or null
  const [isVoting, setIsVoting] = useState(false);

  const netVotes = currentUpvotes - currentDownvotes;
  const userLevel = getUserLevel(currentUser?.points || 1);

  const handleVote = async (voteType) => {
    if (!currentUser) {
      onShowMessage('Please log in to vote', 'error');
      return;
    }

    // Check user level requirements
    if (voteType === 'upvote' && userLevel < 2) {
      onShowMessage('You need Level 2 (15 points) to upvote', 'error');
      return;
    }

    if (voteType === 'downvote' && userLevel < 4) {
      onShowMessage('You need Level 4 (125 points) to downvote', 'error');
      return;
    }

    // Prevent voting on own content (would be checked by API)
    // if (currentUser.username === creator) {
    //   onShowMessage('You cannot vote on your own content', 'error');
    //   return;
    // }

    setIsVoting(true);

    try {
      let response;
      const operation = userVote === voteType ? 'decrement' : 'increment';
      
      if (itemType === 'question') {
        response = await voteOnQuestion(itemId, currentUser.username, {
          operation,
          target: voteType === 'upvote' ? 'upvotes' : 'downvotes'
        });
      } else if (itemType === 'answer') {
        response = await voteOnAnswer(itemId, currentUser.username, {
          operation,
          target: voteType === 'upvote' ? 'upvotes' : 'downvotes'
        });
      }

      if (response.success) {
        // Update local state based on the operation
        if (operation === 'increment') {
          if (voteType === 'upvote') {
            setCurrentUpvotes(prev => prev + 1);
            // Remove previous downvote if exists
            if (userVote === 'downvoted') {
              setCurrentDownvotes(prev => prev - 1);
            }
            setUserVote('upvoted');
          } else {
            setCurrentDownvotes(prev => prev + 1);
            // Remove previous upvote if exists
            if (userVote === 'upvoted') {
              setCurrentUpvotes(prev => prev - 1);
            }
            setUserVote('downvoted');
          }
          onShowMessage(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`, 'success');
        } else {
          // Decrement (undo vote)
          if (voteType === 'upvote') {
            setCurrentUpvotes(prev => prev - 1);
          } else {
            setCurrentDownvotes(prev => prev - 1);
          }
          setUserVote(null);
          onShowMessage('Vote removed', 'info');
        }
      } else {
        onShowMessage('Failed to vote', 'error');
      }
    } catch (error) {
      console.error('Voting error:', error);
      
      // For development, simulate voting
      const operation = userVote === voteType ? 'decrement' : 'increment';
      
      if (operation === 'increment') {
        if (voteType === 'upvote') {
          setCurrentUpvotes(prev => prev + 1);
          if (userVote === 'downvoted') {
            setCurrentDownvotes(prev => prev - 1);
          }
          setUserVote('upvoted');
        } else {
          setCurrentDownvotes(prev => prev + 1);
          if (userVote === 'upvoted') {
            setCurrentUpvotes(prev => prev - 1);
          }
          setUserVote('downvoted');
        }
        onShowMessage(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} (demo mode)`, 'success');
      } else {
        if (voteType === 'upvote') {
          setCurrentUpvotes(prev => prev - 1);
        } else {
          setCurrentDownvotes(prev => prev - 1);
        }
        setUserVote(null);
        onShowMessage('Vote removed (demo mode)', 'info');
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button 
        className={`btn btn-sm ${userVote === 'upvoted' ? 'btn-success' : 'btn-outline-success'}`}
        onClick={() => handleVote('upvote')}
        disabled={isVoting || !currentUser}
        title={userLevel < 2 ? 'Requires Level 2 to upvote' : 'Upvote'}
      >
        <i className="fas fa-chevron-up"></i>
      </button>
      
      <span className="vote-count">{netVotes}</span>
      
      <button 
        className={`btn btn-sm ${userVote === 'downvoted' ? 'btn-danger' : 'btn-outline-danger'}`}
        onClick={() => handleVote('downvote')}
        disabled={isVoting || !currentUser}
        title={userLevel < 4 ? 'Requires Level 4 to downvote' : 'Downvote'}
      >
        <i className="fas fa-chevron-down"></i>
      </button>
    </div>
  );
};

export default VoteButtons;