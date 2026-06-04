import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

export const requestErrorHandler = (error: AxiosError | Error) => {
  return Promise.reject(error);
};