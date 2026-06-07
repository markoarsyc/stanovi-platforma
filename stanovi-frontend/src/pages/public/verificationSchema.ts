import { z } from 'zod';

export const verificationRequestSchema = z.object({
  companyName: z.string().min(1, 'Naziv kompanije je obavezan'),
  tin: z.string().min(1, 'PIB je obavezan'),
});

export type VerificationRequestFormData = z.infer<typeof verificationRequestSchema>;
