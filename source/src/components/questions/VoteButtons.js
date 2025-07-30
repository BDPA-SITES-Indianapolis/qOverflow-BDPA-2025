// source/src/components/questions/VoteButtons.js
import React, { useState, useEffect } from 'react';
import { voteOnQuestion, voteOnAnswer, getUserVote } from '../../services/questions';
import { getUserLevel } from '../../utils/helpers';

const VoteButtons = ({ 
  itemType, 
  itemId, 
  questionId, // needed for answer votes
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

  // Load user's existing vote when component mounts
  useEffect(() => {
    const loadUserVote = async () => {
      if (!currentUser) return;
      
      try {
        const voteResponse = await getUserVote(
          itemType === 'question' ? itemId : questionId, 
          currentUser.username
        );
        
        if (voteResponse.success && voteResponse.vote) {
          setUserVote(voteResponse.vote); // 'upvoted' or 'downvoted'
        }
      } catch (error) {
        // User hasn't voted, which is fine
        console.log('No existing vote found');
      }
    };

    loadUserVote();
  }, [itemId, questionId, itemType, currentUser]);

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

    setIsVoting(true);

    try {
      const operation = userVote === voteType ? 'decrement' : 'increment';
      const target = voteType === 'upvote' ? 'upvotes' : 'downvotes';
      
      let response;
      
      if (itemType === 'question') {
        response = await voteOnQuestion(itemId, currentUser.username, {
          operation,
          target
        });
      } else if (itemType === 'answer') {
        response = await voteOnAnswer(questionId, itemId, currentUser.username, {
          operation,
          target
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
      
      // Handle specific error cases
      if (error.message && error.message.includes('already voted')) {
        onShowMessage('You have already voted on this item', 'error');
      } else if (error.response?.status === 403) {
        onShowMessage('Insufficient privileges to vote', 'error');
      } else if (error.response?.status === 555) {
        onShowMessage('API temporary error (expected behavior)', 'info');
        
        // For development, simulate the vote anyway
        simulateVote(voteType);
      } else {
        onShowMessage('Voting failed. Please try again.', 'error');
      }
    } finally {
      setIsVoting(false);
    }
  };

  // Simulate vote for development/testing
  const simulateVote = (voteType) => {
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
  };

  return (
    <div className="vote-buttons">
      <button 
        className={`btn btn-sm ${userVote === 'upvoted' ? 'btn-success' : 'btn-outline-success'}`}
        onClick={() => handleVote('upvote')}
        disabled={isVoting || !currentUser}
        title={
          !currentUser ? 'Please log in to vote' :
          userLevel < 2 ? 'Requires Level 2 to upvote' : 
          userVote === 'upvoted' ? 'Remove upvote' : 'Upvote'
        }
      >
        <i className="fas fa-chevron-up"></i>
      </button>
      
      <span className="vote-count">{netVotes}</span>
      
      <button 
        className={`btn btn-sm ${userVote === 'downvoted' ? 'btn-danger' : 'btn-outline-danger'}`}
        onClick={() => handleVote('downvote')}
        disabled={isVoting || !currentUser}
        title={
          !currentUser ? 'Please log in to vote' :
          userLevel < 4 ? 'Requires Level 4 to downvote' : 
          userVote === 'downvoted' ? 'Remove downvote' : 'Downvote'
        }
      >
        <i className="fas fa-chevron-down"></i>
      </button>
      
      {isVoting && (
        <div className="text-center mt-1">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Voting...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteButtons;