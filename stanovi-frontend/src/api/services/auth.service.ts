import api from "../axios";
import { tokenStorage } from "@/shared/utils/storage";

// Tipovi za odgovor sa servera
export interface AuthResponse {
  access_token: string;
}

export const authService = {
  /**
   * Prijava korisnika
   */
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  /**
   * Registracija Buyer-a - atomska transakcija (User + Buyer profil)
   */
  async registerBuyer(formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register-buyer", formData);
    return response.data;
  },

  /**
   * Registracija Investor-a - atomska transakcija (User + Investor profil)
   */
  async registerInvestor(formData: {
    email: string;
    password: string;
    companyName: string;
    tin?: string;
    contactEmail: string;
    contactPhone: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register-investor", formData);
    return response.data;
  },

  /**
   * Pomoćna metoda za logout
   */
  logout() {
    tokenStorage.clear();
    delete api.defaults.headers.common['Authorization'];
  }
};