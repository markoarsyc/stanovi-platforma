import { z } from 'zod';

export const buyerProfileSchema = z.object({
  firstName: z.string().min(1, 'Ime je obavezno'),
  lastName: z.string().min(1, 'Prezime je obavezno'),
  phone: z.string().min(1, 'Telefon je obavezan'),
});

export type BuyerProfileFormValues = z.infer<typeof buyerProfileSchema>;

export const investorProfileSchema = z.object({
  companyName: z.string().min(1, 'Naziv kompanije je obavezan'),
  tin: z.string().min(1, 'PIB je obavezan'),
  contactEmail: z.string().email('Unesite ispravan email'),
  contactPhone: z.string().min(1, 'Kontakt telefon je obavezan'),
});

export type InvestorProfileFormValues = z.infer<typeof investorProfileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Unesite trenutnu lozinku'),
    newPassword: z.string().min(6, 'Nova lozinka mora imati najmanje 6 karaktera'),
    confirmPassword: z.string().min(1, 'Potvrdite novu lozinku'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lozinke se ne podudaraju',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
