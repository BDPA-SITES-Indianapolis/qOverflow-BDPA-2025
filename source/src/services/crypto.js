// source/src/services/crypto.js
// PBKDF2 implementation using Web Crypto API for BDPA competition

// Generate a random salt (16 bytes = 32 hex characters)
export const generateSalt = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };
  
  // Derive login key using PBKDF2 with Web Crypto API
  export const deriveLoginKey = async (password, saltHex) => {
    try {
      // Convert password to ArrayBuffer
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // Convert hex salt to ArrayBuffer
      const saltArray = new Uint8Array(
        saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      
      // Import the password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      // Derive the key using PBKDF2
      // Competition requires exactly 100,000 iterations
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltArray,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        512 // 64 bytes = 512 bits
      );
      
      // Convert ArrayBuffer to hex string
      const derivedArray = new Uint8Array(derivedBits);
      const hexKey = Array.from(derivedArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return hexKey;
    } catch (error) {
      console.error('Error deriving login key:', error);
      throw new Error('Failed to process password');
    }
  };
  
  // Create salt and key for new user registration
  export const createUserCredentials = async (password) => {
    try {
      const salt = generateSalt();
      const key = await deriveLoginKey(password, salt);
      
      return { salt, key };
    } catch (error) {
      console.error('Error creating user credentials:', error);
      throw new Error('Failed to create user credentials');
    }
  };
  
  // Verify password against stored salt and key
  export const verifyPassword = async (password, storedSalt, storedKey) => {
    try {
      const derivedKey = await deriveLoginKey(password, storedSalt);
      return derivedKey === storedKey;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };
  
  // Utility function to check if Web Crypto API is available
  export const isWebCryptoSupported = () => {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' && 
           typeof crypto.getRandomValues === 'function';
  };
  
  // Fallback error for unsupported browsers
  export const checkCryptoSupport = () => {
    if (!isWebCryptoSupported()) {
      throw new Error('This browser does not support the required cryptographic features');
    }
  };
  
  export default {
    generateSalt,
    deriveLoginKey,
    createUserCredentials,
    verifyPassword,
    isWebCryptoSupported,
    checkCryptoSupport
  };