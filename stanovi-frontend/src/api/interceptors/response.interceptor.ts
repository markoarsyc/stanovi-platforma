import type { AxiosResponse, AxiosError } from 'axios';

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

export const responseErrorHandler = (error: AxiosError | Error) => {
  if ((error as AxiosError).response?.status === 401) {
    console.warn('Sesija je istekla, čišćenje podataka...');
    localStorage.removeItem('auth_token');
  }
  
  return Promise.reject(error);
};