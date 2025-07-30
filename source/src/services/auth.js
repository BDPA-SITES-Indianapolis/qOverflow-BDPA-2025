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
      // Get full user data after successful authentication
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
const getUserLevel = (points = 1) => {
  if (points >= 10000) return 7;
  if (points >= 3000) return 6;
  if (points >= 1000) return 5;
  if (points >= 125) return 4;
  if (points >= 50) return 3;
  if (points >= 15) return 2;
  return 1;
};
