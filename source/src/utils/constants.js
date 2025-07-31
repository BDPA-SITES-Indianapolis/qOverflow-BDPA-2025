// source/src/utils/constants.js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://qoverflow.api.hscc.bdpa.org/v1';
export const API_KEY = process.env.REACT_APP_API_KEY;

export const USER_LEVELS = {
  1: { points: 1, privileges: ['Create answers'] },
  2: { points: 15, privileges: ['Create answers', 'Upvote questions and answers'] },
  3: { points: 50, privileges: ['Create answers', 'Upvote questions and answers', 'Comment on any question or answer'] },
  4: { points: 125, privileges: ['Create answers', 'Upvote questions and answers', 'Comment on any question or answer', 'Downvote questions and answers'] },
  5: { points: 1000, privileges: ['Create answers', 'Upvote questions and answers', 'Comment on any question or answer', 'Downvote questions and answers', 'View individual vote counts'] },
  6: { points: 3000, privileges: ['All Level 5 privileges', 'Vote to protect questions'] },
  7: { points: 10000, privileges: ['All Level 6 privileges', 'Vote to close/reopen questions'] }
};

export const POINT_VALUES = {
  ASK_QUESTION: 1,
  ANSWER_QUESTION: 2,
  QUESTION_UPVOTE: 5,
  QUESTION_DOWNVOTE: -1,
  ANSWER_UPVOTE: 10,
  ANSWER_DOWNVOTE: -5,
  DOWNVOTE_PENALTY: -1,
  ACCEPTED_ANSWER: 15
};

export const SORT_OPTIONS = {
  RECENT: '',
  BEST: 'u',
  INTERESTING: 'uvc',
  HOT: 'uvac'
};