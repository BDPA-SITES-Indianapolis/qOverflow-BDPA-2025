// source/src/services/api.js - WITH SIMPLE RATE LIMITING
import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/constants';

// Simple rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1000ms between requests (2 per second max)

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Authorization': `bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Request interceptor with rate limiting
api.interceptors.request.use(
  async (config) => {
    // Rate limiting - wait if needed
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
    
    if (error.response?.status === 429) {
      console.error('🚨 Still rate limited - API needs more time');
    } else if (error.response?.status === 401) {
      console.error('🔑 Unauthorized - check API key');
    } else if (error.response?.status === 555) {
      console.error('🎲 Random API error (expected)');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// // source/src/services/api.js - SIMPLE WORKING VERSION
// import axios from 'axios';
// import { API_BASE_URL, API_KEY } from '../utils/constants';

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000, // 30 second timeout
//   headers: {
//     'Authorization': `bearer ${API_KEY}`,
//     'Content-Type': 'application/json'
//   }
// });

// // Response interceptor to return just the data
// api.interceptors.response.use(
//   (response) => {
//     console.log(`✅ API Success: ${response.status} ${response.config.url}`);
//     return response.data; // Return just the data part
//   },
//   (error) => {
//     console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
    
//     if (error.response?.status === 429) {
//       console.error('🚨 Rate limited - too many requests');
//     } else if (error.response?.status === 401) {
//       console.error('🔑 Unauthorized - check API key');
//     } else if (error.response?.status === 555) {
//       console.error('🎲 Random API error (expected)');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

// // // source/src/services/api.js
// // import axios from 'axios';
// // import { API_BASE_URL, API_KEY } from '../utils/constants';

// // // Create axios instance with default config
// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     'Authorization': `bearer ${API_KEY}`,
// //     'Content-Type': 'application/json'
// //   }
// // });

// // // Request interceptor for logging
// // api.interceptors.request.use(
// //   (config) => {
// //     console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
// //     return config;
// //   },
// //   (error) => {
// //     console.error('API Request Error:', error);
// //     return Promise.reject(error);
// //   }
// // );

// // // Request interceptor for logging
// // api.interceptors.request.use(
// //     (config) => {
// //       console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
// //       return config;
// //     },
// //     (error) => {
// //       console.error('API Request Error:', error);
// //       return Promise.reject(error);
// //     }
// //   );

// //   // Response interceptor for error handling
// // api.interceptors.response.use(
// //     (response) => {
// //       return response.data;
// //     },
// //     (error) => {
// //       console.error('API Response Error:', error);
      
// //       // Handle specific error cases
// //       if (error.response?.status === 401) {
// //         console.error('Unauthorized - check API key');
// //       } else if (error.response?.status === 429) {
// //         console.error('Rate limited - slow down requests');
// //       } else if (error.response?.status === 555) {
// //         console.error('API returned random error (expected behavior)');
// //       }
      
// //       return Promise.reject(error);
// //     }
// //   );
  
// //   export default api;