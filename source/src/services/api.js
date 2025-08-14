// source/src/services/api.js
import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/constants';

const MIN_REQUEST_INTERVAL = 1000; // adjust to actual API limit
let requestQueue = Promise.resolve();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Queue each request to ensure spacing
api.interceptors.request.use(config => {
  requestQueue = requestQueue.then(async () => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    await new Promise(res => setTimeout(res, MIN_REQUEST_INTERVAL));
    return config;
  });
  return requestQueue;
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response.data;
  },
  async (error) => {
    const status = error.response?.status;
    console.error(`❌ API Error: ${status} ${error.config?.url}`);

    if (status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10) * 1000;
      console.error(`🚨 Rate limited — retrying after ${retryAfter}ms`);
      await new Promise(res => setTimeout(res, retryAfter));
      return api.request(error.config); // retry original request
    }

    return Promise.reject(error);
  }
);

export default api;
