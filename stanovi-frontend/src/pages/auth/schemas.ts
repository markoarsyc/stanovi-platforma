import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Unesite ispravan email'),
  password: z.string().min(6, 'Lozinka mora imati bar 6 karaktera'),
});

export const registerBuyerSchema = loginSchema.extend({
  firstName: z.string().min(1, 'Ime je obavezno'),
  lastName: z.string().min(1, 'Prezime je obavezno'),
  phone: z.string().min(1, 'Telefon je obavezan'),
});

export const registerInvestorSchema = loginSchema.extend({
  companyName: z.string().min(1, 'Naziv firme je obavezan'),
  tin: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Unesite ispravan email firme'),
  contactPhone: z.string().min(1, 'Telefon firme je obavezan'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterBuyerFormData = z.infer<typeof registerBuyerSchema>;
export type RegisterInvestorFormData = z.infer<typeof registerInvestorSchema>;
