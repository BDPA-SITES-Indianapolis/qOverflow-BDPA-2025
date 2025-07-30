// source/src/services/questions.js - Updated with missing getUserVote function
import api from './api';

// Search questions
export const searchQuestions = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.after) queryParams.append('after', params.after);
    if (params.match) queryParams.append('match', encodeURIComponent(JSON.stringify(params.match)));
    if (params.search) {
      // Simple text search
      const searchQuery = { title: params.search };
      queryParams.append('match', encodeURIComponent(JSON.stringify(searchQuery)));
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

// Check user's vote on question - MISSING FUNCTION ADDED
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