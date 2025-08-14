// source/src/services/auth.js - Real Authentication Service
import api from './api';

// PBKDF2 function using Web Crypto API
export const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = new Uint8Array(salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000, // Competition requirement
      hash: 'SHA-256'
    },
    keyMaterial,
    512 // 64 bytes = 512 bits
  );

  // Convert to hex string
  const derivedArray = new Uint8Array(derivedBits);
  return Array.from(derivedArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Generate random salt
export const generateSalt = () => {
  const array = new Uint8Array(16); // 16 bytes = 32 hex characters
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const salt = generateSalt();
    const key = await deriveKey(userData.password, salt);

    const response = await api.post('/users', {
      username: userData.username,
      email: userData.email,
      salt: salt,
      key: key
    });

    if (response.success) {
      return { success: true, user: response.user };
    } else {
      return { success: false, error: 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
   
    if (error.response?.status === 400) {
      return { success: false, error: 'Username or email already exists' };
    }
   
    return { success: false, error: 'Registration failed. Please try again.' };
  }
};

// Badge definitions
const BADGES = [
  { name: 'First Login', type: 'bronze', action: 'login' },
  { name: 'Profile Complete', type: 'silver', action: 'profile_complete' },
  { name: '1000 Points', type: 'gold', action: 'reach_1000_points' },
  { name: 'Great Question', type: 'gold', action: 'great_question' }, // Net question points >= 100
  { name: 'Great Answer', type: 'gold', action: 'great_answer' },     // Accepted answer points >= 100
  { name: 'Socratic', type: 'gold', action: 'socratic' },             // User points >= 10000
  { name: 'Zombie', type: 'gold', action: 'zombie' },                 // Question reopened

  // Silver badges
  { name: 'Good Question', type: 'silver', action: 'good_question' },     // Net question points >= 25
  { name: 'Good Answer', type: 'silver', action: 'good_answer' },         // Accepted answer points >= 25
  { name: 'Inquisitive', type: 'silver', action: 'inquisitive' },         // User points >= 3000
  { name: 'Protected', type: 'silver', action: 'protected' },             // Question is protected

  // Bronze badges
  { name: 'Nice Question', type: 'bronze', action: 'nice_question' },     // Net question points >= 10
  { name: 'Nice Answer', type: 'bronze', action: 'nice_answer' },         // Accepted answer points >= 10
  { name: 'Curious', type: 'bronze', action: 'curious' },                 // User points >= 100
  { name: 'Scholar', type: 'bronze', action: 'scholar' },                 // Accept an answer
  // Add more badges as needed
];

// Award badge to user
export const awardBadge = async (username, action, userPoints = 0) => {
  // Find badge for this action
  let badge = BADGES.find(b => b.action === action);

  // Special case: reaching 1000 points
  if (action === 'reach_1000_points' && userPoints < 1000) return null;

  if (!badge) return null;

  // Call API to award badge (assumes endpoint exists)
  try {
    const response = await api.post(`/users/${username}/badges`, {
      badge: badge.name,
      type: badge.type
    });
    return response.success ? badge : null;
  } catch (error) {
    console.error('Award badge error:', error);
    return null;
  }
};

// Authenticate user
export const authenticateUser = async (username, password) => {
  try {
    // First, get the user's salt
    const userResponse = await api.get(`/users/${username}`);
   
    if (!userResponse.success) {
      return { success: false, error: 'User not found' };
    }

    const { salt } = userResponse.user;
   
    // Derive key using the salt
    const key = await deriveKey(password, salt);

    // Authenticate with the API
    const authResponse = await api.post(`/users/${username}/auth`, {
      key: key
    });

    if (authResponse.success) {
      // Award "First Login" badge
      await awardBadge(username, 'login', userResponse.user.points);

      return {
        success: true,
        user: {
          ...userResponse.user,
          level: getUserLevel(userResponse.user.points)
        }
      };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Authentication error:', error);
   
    if (error.response?.status === 403) {
      return { success: false, error: 'Invalid username or password' };
    }
   
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

// Get user level from points
// Update: Level 7 now at 2000 points (not 10000)
const getUserLevel = (points = 1) => {
  if (points >= 10000) return 8; // Optionally keep a higher level
  if (points >= 3000) return 7;
  if (points >= 2000) return 7; // Level 7: edit voting
  if (points >= 1000) return 6;
  if (points >= 125) return 5;
  if (points >= 50) return 4;
  if (points >= 15) return 3;
  return 1;
};

// Example: award badge when user reaches 1000 points (call this after updating points)
export const checkAndAwardPointBadges = async (username, points) => {
  if (points >= 1000) {
    await awardBadge(username, 'reach_1000_points', points);
  }
};

/**
 * Checks if a user can vote on a comment.
 * @param {Object} user - The user object (must include username and level).
 * @param {Object} comment - The comment object (must include author and votes).
 * @param {'upvote'|'downvote'} voteType - The type of vote.
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function canVoteOnComment(user, comment, voteType) {
  if (!user || !user.username) {
    return { allowed: false, reason: 'User not authenticated' };
  }
  if (user.username === comment.author) {
    return { allowed: false, reason: 'Cannot vote on your own comment' };
  }
  // Check if user already voted
  if (comment.votes) {
    if (comment.votes.upvoters?.includes(user.username)) {
      if (voteType === 'upvote') {
        return { allowed: false, reason: 'Already upvoted' };
      }
      return { allowed: false, reason: 'Cannot downvote after upvoting' };
    }
    if (comment.votes.downvoters?.includes(user.username)) {
      if (voteType === 'downvote') {
        return { allowed: false, reason: 'Already downvoted' };
      }
      return { allowed: false, reason: 'Cannot upvote after downvoting' };
    }
  }
  // Level checks
  if (voteType === 'upvote' && user.level < 2) {
    return { allowed: false, reason: 'Level too low to upvote' };
  }
  if (voteType === 'downvote' && user.level < 4) { // Change to 5 after requirement update
    return { allowed: false, reason: 'Level too low to downvote' };
  }
  return { allowed: true };
}

// Example usage in your comment voting handler:
export async function voteOnComment({ user, comment, voteType }) {
  const check = canVoteOnComment(user, comment, voteType);
  if (!check.allowed) {
    return { success: false, error: check.reason };
  }
  // ...call API to register the vote...
  // e.g. await api.post(`/comments/${comment.id}/vote`, { voteType });
  return { success: true };
}

// Check if user can trigger or vote on an edit for Q/A
/**
 * Checks if a user can trigger or vote on an edit for a question or answer.
 * @param {Object} user - The user object (must include level).
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function canEditVote(user) {
  if (!user || !user.username) {
    return { allowed: false, reason: 'User not authenticated' };
  }
  if (user.level < 7) {
    return { allowed: false, reason: 'Level 7 required to vote on edits' };
  }
  return { allowed: true };
}

// Example usage for triggering an edit vote
/**
 * Triggers an edit vote on a question or answer.
 * @param {Object} params
 *   - user: the authed user object
 *   - postType: 'question' | 'answer'
 *   - postId: the id of the question or answer
 *   - newTitle: (optional) new title for question
 *   - newBody: new body text
 * @returns {Promise<Object>} result
 */
export async function triggerEditVote({ user, postType, postId, newTitle, newBody }) {
  const check = canEditVote(user);
  if (!check.allowed) {
    return { success: false, error: check.reason };
  }
  // Call API to trigger edit vote (API endpoint must exist)
  try {
    const payload = { newBody };
    if (postType === 'question' && newTitle) payload.newTitle = newTitle;
    const response = await api.post(`/${postType}s/${postId}/edit-votes`, payload);
    return response.success
      ? { success: true }
      : { success: false, error: response.error || 'Failed to trigger edit vote' };
  } catch (error) {
    return { success: false, error: 'Failed to trigger edit vote' };
  }
}

// Example usage for voting "yes" on an edit
/**
 * Votes "yes" on a pending edit for a question or answer.
 * @param {Object} params
 *   - user: the authed user object
 *   - postType: 'question' | 'answer'
 *   - postId: the id of the question or answer
 *   - editVoteId: the id of the edit vote
 * @returns {Promise<Object>} result
 */
export async function voteOnEdit({ user, postType, postId, editVoteId }) {
  const check = canEditVote(user);
  if (!check.allowed) {
    return { success: false, error: check.reason };
  }
  try {
    const response = await api.post(`/${postType}s/${postId}/edit-votes/${editVoteId}/vote`, { vote: 'yes' });
    return response.success
      ? { success: true }
      : { success: false, error: response.error || 'Failed to vote on edit' };
  } catch (error) {
    return { success: false, error: 'Failed to vote on edit' };
  }
}
