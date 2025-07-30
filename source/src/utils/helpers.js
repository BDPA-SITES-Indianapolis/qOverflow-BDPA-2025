// source/src/utils/helpers.js
import CryptoJS from 'crypto-js';

// Gravatar URL generation
export const getGravatarUrl = (email) => {
  if (!email) return 'https://www.gravatar.com/avatar/default?d=identicon';
  
  const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

// Format time ago
export const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

// Get user level based on points
export const getUserLevel = (points = 1) => {
  if (points >= 10000) return 7;
  if (points >= 3000) return 6;
  if (points >= 1000) return 5;
  if (points >= 125) return 4;
  if (points >= 50) return 3;
  if (points >= 15) return 2;
  return 1;
};

// Get level privileges
export const getLevelPrivileges = (level) => {
  const privileges = [];
  
  if (level >= 1) privileges.push('Create answers');
  if (level >= 2) privileges.push('Upvote questions and answers');
  if (level >= 3) privileges.push('Comment on any question or answer');
  if (level >= 4) privileges.push('Downvote questions and answers');
  if (level >= 5) privileges.push('View individual upvote/downvote counts');
  if (level >= 6) privileges.push('Vote to protect questions');
  if (level >= 7) privileges.push('Vote to close/reopen questions');
  
  return privileges;
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  if (password.length <= 10) return { strength: 'weak', color: 'danger' };
  if (password.length <= 17) return { strength: 'moderate', color: 'warning' };
  return { strength: 'strong', color: 'success' };
};

// Truncate text
export const truncateText = (text, maxLength = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};