// src/services/comments.js
import api from './api';

// ...existing code...

// Vote on a comment (upvote, downvote, unvote)
export const voteOnComment = async (parentType, parentId, questionId, commentId, voteType) => {
  let url;
  if (parentType === 'question') {
    url = `/questions/${parentId}/comments/${commentId}/vote`;
  } else if (parentType === 'answer') {
    url = `/questions/${questionId}/answers/${parentId}/comments/${commentId}/vote`;
  } else {
    throw new Error('Invalid parent type');
  }
  const response = await api.patch(url, { voteType });
  return response;
};
