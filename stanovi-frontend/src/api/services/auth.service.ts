import api from "../axios";
import { Role } from "../../shared/types/enums/role.enum";

// Tipovi za odgovor sa servera radi lakšeg korišćenja
export interface AuthResponse {
  access_token: string;
}

export const authService = {
  /**
   * Prijava korisnika
   */
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    // Vraćamo ceo data objekt (koji sadrži access_token)
    // AuthContext će preuzeti ovaj objekt i sačuvati token
    return response.data;
  },

  /**
   * Registracija korisnika i automatsko kreiranje profila (Buyer ili Investor)
   */
  async register(formData: any, role: Role): Promise<AuthResponse> {
    // 1. Registracija osnovnog naloga (User u bazi)
    const regResponse = await api.post<AuthResponse>("/auth/register", {
      email: formData.email,
      password: formData.password,
      role: role,
    });

    /**
     * VAŽNO: Pošto kreiranje profila (Buyer/Investor) na tvom backendu 
     * verovatno zahteva autentifikaciju, moramo privremeno postaviti token 
     * u axios zaglavlje ili localStorage da bi sledeći poziv prošao.
     */
    const token = regResponse.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Priprema podataka za profil zavisno od uloge
    const isBuyer = role === Role.BUYER;
    const profileEndpoint = isBuyer ? "/buyers" : "/investors";
    
    const profilePayload = isBuyer
      ? { 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          phone: formData.phone 
        }
      : { 
          companyName: formData.companyName, 
          tin: formData.tin, 
          contactEmail: formData.contactEmail || formData.email,
          contactPhone: formData.contactPhone 
        };

    // 3. Kreiranje profila
    try {
      await api.post(profileEndpoint, profilePayload);
    } catch (error) {
      console.error("Greška pri kreiranju profila, ali nalog je napravljen:", error);
      // Ovde možeš odlučiti da li želiš da baciš grešku ili pustiš korisnika dalje
    }
    
    // Vraćamo originalni odgovor sa registracije (token)
    return regResponse.data;
  },

  /**
   * Pomoćna metoda za logout (opciono, jer AuthContext već ima svoju)
   */
  logout() {
    localStorage.removeItem("auth_token");
    delete api.defaults.headers.common['Authorization'];
  }
};