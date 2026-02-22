import type { Role } from "../enums/role.enum";

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}