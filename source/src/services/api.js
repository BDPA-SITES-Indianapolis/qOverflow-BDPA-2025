// source/src/services/api.js
import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('Unauthorized - check API key');
    } else if (error.response?.status === 429) {
      console.error('Rate limited - slow down requests');
    } else if (error.response?.status === 555) {
      console.error('API returned random error (expected behavior)');
    }
    
    return Promise.reject(error);
  }
);

export default api;
// // source/src/services/api.js
// import axios from 'axios';
// import { API_BASE_URL, API_KEY } from '../utils/constants';

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Authorization': `bearer ${API_KEY}`,
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor for logging
// api.interceptors.request.use(
//   (config) => {
//     console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
//     return config;
//   },
//   (error) => {
//     console.error('API Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Request interceptor for logging
// api.interceptors.request.use(
//     (config) => {
//       console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
//       return config;
//     },
//     (error) => {
//       console.error('API Request Error:', error);
//       return Promise.reject(error);
//     }
//   );

//   // Response interceptor for error handling
// api.interceptors.response.use(
//     (response) => {
//       return response.data;
//     },
//     (error) => {
//       console.error('API Response Error:', error);
      
//       // Handle specific error cases
//       if (error.response?.status === 401) {
//         console.error('Unauthorized - check API key');
//       } else if (error.response?.status === 429) {
//         console.error('Rate limited - slow down requests');
//       } else if (error.response?.status === 555) {
//         console.error('API returned random error (expected behavior)');
//       }
      
//       return Promise.reject(error);
//     }
//   );
  
//   export default api;


// // source/src/services/api.js
// import axios from 'axios';
// import { API_BASE_URL, API_KEY } from '../utils/constants';

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Authorization': `bearer ${API_KEY}`,
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor for logging
// api.interceptors.request.use(
//   (config) => {
//     console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
//     return config;
//   },
//   (error) => {
//     console.error('API Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     return response.data;
//   },
//   (error) => {
//     console.error('API Response Error:', error);
    
//     // Handle specific error cases
//     if (error.response?.status === 401) {
//       console.error('Unauthorized - check API key');
//     } else if (error.response?.status === 429) {
//       console.error('Rate limited - slow down requests');
//     } else if (error.response?.status === 555) {
//       console.error('API returned random error (expected behavior)');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

