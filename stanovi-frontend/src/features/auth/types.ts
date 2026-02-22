import { Role } from "../../shared/types/enums/role.enum";

export interface RegisterDTO {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}