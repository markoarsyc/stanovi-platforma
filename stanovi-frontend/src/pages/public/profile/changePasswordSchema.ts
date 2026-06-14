import { z } from 'zod';

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

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
