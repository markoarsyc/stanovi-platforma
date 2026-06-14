import { z } from 'zod';

export const buyerProfileSchema = z.object({
  firstName: z.string().min(1, 'Ime je obavezno'),
  lastName: z.string().min(1, 'Prezime je obavezno'),
  phone: z.string().min(1, 'Telefon je obavezan'),
});

export type BuyerProfileFormData = z.infer<typeof buyerProfileSchema>;
