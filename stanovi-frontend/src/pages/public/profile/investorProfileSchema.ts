import { z } from 'zod';

export const investorProfileSchema = z.object({
  companyName: z.string().min(1, 'Naziv kompanije je obavezan'),
  tin: z.string().min(1, 'PIB je obavezan'),
  contactEmail: z.string().email('Unesite ispravan email'),
  contactPhone: z.string().min(1, 'Kontakt telefon je obavezan'),
});

export type InvestorProfileFormData = z.infer<typeof investorProfileSchema>;
