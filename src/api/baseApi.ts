import axios, { AxiosError } from 'axios';
import { toCamelCase } from '../utils/caseConverter';

const api = axios.create({
  baseURL: import.meta.env.VITE_BE_URL || 'http://localhost:3000/',
  timeout: 30000,
});

api.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('No access token found in localStorage');
    }

    // Convert data to snake_case
    /* if (config.data) {
      config.data = toSnakeCase(config.data);
    } */

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Convert response data to camelCase
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 401
    if (error.response?.status === 401) {
      console.error(
        'Unauthorized access - redirecting to login from baseApi.ts',
      );
    }
    return Promise.reject(error);
  },
);

export default api;
