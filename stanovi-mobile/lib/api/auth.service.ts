import { api } from '@/lib/api/client';

export interface AuthResponse {
  access_token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterBuyerPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface RegisterInvestorPayload {
  email: string;
  password: string;
  companyName: string;
  tin?: string;
  contactEmail: string;
  contactPhone: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function registerBuyer(payload: RegisterBuyerPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register-buyer', payload);
  return data;
}

export async function registerInvestor(payload: RegisterInvestorPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register-investor', payload);
  return data;
}
