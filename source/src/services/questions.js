import api from './api';
// Award bounty to answer creator when answer is accepted
/**
 * Awards the bounty for a question to the creator of the accepted answer.
 * Only works if the question has a bounty and the answer is being accepted.
 * @param {string} questionId
 * @param {string} answerId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const awardBountyToAcceptedAnswer = async (questionId, answerId) => {
  try {
    // Get bounty info for the question
    const bountyRes = await api.get(`/questions/${questionId}/bounties`);
    if (!bountyRes.success || !bountyRes.bounty) {
      return { success: false, error: 'No bounty to award for this question.' };
    }
    const { amount, awarded, answer_id, awarded_to } = bountyRes.bounty;
    if (awarded) {
      return { success: false, error: 'Bounty already awarded.' };
    }
    if (answer_id && awarded_to) {
      return { success: false, error: 'Bounty already assigned.' };
    }
    // Get answer info to find creator
    const answerRes = await api.get(`/questions/${questionId}/answers/${answerId}`);
    if (!answerRes.success || !answerRes.answer) {
      return { success: false, error: 'Accepted answer not found.' };
    }
    const answerCreator = answerRes.answer.creator;
    // Award bounty points to answer creator
    const awardRes = await api.patch(`/users/${answerCreator}/points`, { delta: amount });
    if (!awardRes.success) {
      return { success: false, error: awardRes.error || 'Failed to award bounty points.' };
    }
    // Mark bounty as awarded (permanent)
    const markRes = await api.patch(`/questions/${questionId}/bounties/award`, {
      answer_id: answerId,
      awarded_to: answerCreator
    });
    if (!markRes.success) {
      return { success: false, error: markRes.error || 'Failed to mark bounty as awarded.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to award bounty.' };
  }
};
// Add a bounty to a question
/**
 * Adds a bounty to a question if allowed.
 * @param {string} questionId - The question to add a bounty to
 * @param {string} username - The user adding the bounty
 * @param {number} bountyAmount - The amount of points to add as bounty
 * @param {number} userPoints - The user's current points
 * @param {boolean} hasAcceptedAnswer - Whether the question already has an accepted answer
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addBountyToQuestion = async (questionId, username, bountyAmount, userPoints, hasAcceptedAnswer) => {
  // Business rules
  if (hasAcceptedAnswer) {
    return { success: false, error: 'Cannot add bounty to a question with an accepted answer.' };
  }
  if (bountyAmount < 75 || bountyAmount > 500) {
    return { success: false, error: 'Bounty must be between 75 and 500 points.' };
  }
  if ((userPoints - bountyAmount) < 75) {
    return { success: false, error: 'You must have at least 75 points remaining after adding a bounty.' };
  }
  try {
    // Check if question already has a bounty
    const bountyCheck = await api.get(`/questions/${questionId}/bounties`);
    if (bountyCheck.success && bountyCheck.bounty) {
      return { success: false, error: 'This question already has a bounty.' };
    }
    // Deduct points from user immediately
    const deductRes = await api.patch(`/users/${username}/points`, { delta: -bountyAmount });
    if (!deductRes.success) {
      return { success: false, error: deductRes.error || 'Failed to deduct points.' };
    }
    // Add bounty to question (permanent)
    const bountyRes = await api.post(`/questions/${questionId}/bounties`, {
      username,
      amount: bountyAmount
    });
    if (!bountyRes.success) {
      // Refund points if bounty add fails
      await api.patch(`/users/${username}/points`, { delta: bountyAmount });
      return { success: false, error: bountyRes.error || 'Failed to add bounty.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to add bounty.' };
  }
};
// source/src/services/questions.js - Clean version without duplicates



// Search questions
export const searchQuestions = async (params = {}) => {
  
  try {
    const queryParams = new URLSearchParams();

    if (params.sort) queryParams.append('sort', params.sort);
    if (params.after) queryParams.append('after', params.after);

    // Build match object for text and tags
    let match = {};
   
    if (params.search) {
      // Search in title and/or text
      match.title = params.search;
      // Optionally: match.text = params.search;
    }
    if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
      match.tags = { $in: params.tags };
    }

    if (Object.keys(match).length > 0) {
      queryParams.append('match', JSON.stringify(match));
    }

    const response = await api.get(`/questions/search?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
  
};




// Get single question
export const getQuestion = async (questionId) => {
  try {
    const response = await api.get(`/questions/${questionId}`);
    return response;
  } catch (error) {
    console.error('Error getting question:', error);
    throw error;
  }
};

// Create new question
export const createQuestion = async (questionData) => {
  try {
    const response = await api.post('/questions', questionData);
    return response;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Vote on question
export const voteOnQuestion = async (questionId, username, voteData) => {
  try {
    const response = await api.patch(`/questions/${questionId}/vote/${username}`, voteData);
    return response;
  } catch (error) {
    console.error('Error voting on question:', error);
    throw error;
  }
};

// Check user's vote on question
export const getUserVote = async (questionId, username) => {
  try {
    const response = await api.get(`/questions/${questionId}/vote/${username}`);
    return response;
  } catch (error) {
    if (error.response?.status === 404) {
      // User hasn't voted - this is normal
      return { success: true, vote: null };
    }
    console.error('Error getting user vote:', error);
    throw error;
  }
};

// Get question answers
export const getQuestionAnswers = async (questionId, after = null) => {
  try {
    const url = after ? 
      `/questions/${questionId}/answers?after=${after}` : 
      `/questions/${questionId}/answers`;
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Error getting answers:', error);
    throw error;
  }
};

// Create answer
export const createAnswer = async (questionId, answerData) => {
  try {
    const response = await api.post(`/questions/${questionId}/answers`, answerData);
    return response;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

// Vote on answer
export const voteOnAnswer = async (questionId, answerId, username, voteData) => {
  try {
    const response = await api.patch(`/questions/${questionId}/answers/${answerId}/vote/${username}`, voteData);
    return response;
  } catch (error) {
    console.error('Error voting on answer:', error);
    throw error;
  }
};

// Update question views
export const incrementQuestionViews = async (questionId) => {
  try {
    const response = await api.patch(`/questions/${questionId}`, {
      views: 'increment'
    });
    return response;
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
};