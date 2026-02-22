import type { AxiosResponse } from 'axios';

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

export const responseErrorHandler = (error: any) => {
  if (error.response?.status === 401) {
    console.warn('Sesija je istekla, čišćenje podataka...');
    localStorage.removeItem('auth_token');
  }
  
  return Promise.reject(error);
};