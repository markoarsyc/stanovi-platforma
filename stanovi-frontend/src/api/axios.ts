import axios from 'axios';
import { requestInterceptor, requestErrorHandler } from './interceptors/request.interceptor';
import { responseInterceptor, responseErrorHandler } from './interceptors/response.interceptor';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Connecting interceptors
api.interceptors.request.use(requestInterceptor, requestErrorHandler);
api.interceptors.response.use(responseInterceptor, responseErrorHandler);

export default api;