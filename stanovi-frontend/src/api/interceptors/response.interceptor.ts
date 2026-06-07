import type { AxiosResponse, AxiosError } from 'axios';
import { tokenStorage } from '@/shared/utils/storage';

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

export const responseErrorHandler = (error: AxiosError | Error) => {
  if ((error as AxiosError).response?.status === 401) {
    console.warn('Sesija je istekla, čišćenje podataka...');
    tokenStorage.clear();
  }

  return Promise.reject(error);
};
