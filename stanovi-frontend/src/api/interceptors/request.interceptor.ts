import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenStorage } from '@/shared/utils/storage';

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const requestErrorHandler = (error: AxiosError | Error) => {
  return Promise.reject(error);
};
