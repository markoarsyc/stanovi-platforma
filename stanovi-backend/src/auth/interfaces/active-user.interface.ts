import { Role } from '@prisma/client';

export interface ActiveUser {
  id: string;
  email: string;
  role: Role;
}