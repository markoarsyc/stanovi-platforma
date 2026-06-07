import { z } from 'zod';
import { BuildingStatus } from '@/shared/types/enums/building-status.enum';
import { todayInputDate } from '@/shared/utils/format';

export const buildingSchema = z.object({
  title: z.string().min(1, 'Naziv projekta je obavezan'),
  locationId: z.number().int().positive('Izaberite opštinu'),
  address: z.string().min(1, 'Adresa je obavezna'),
  description: z.string().optional().or(z.literal('')),
  dueDate: z
    .string()
    .min(1, 'Rok završetka je obavezan')
    .refine((d) => d >= todayInputDate(), 'Datum mora biti u budućnosti'),
  status: z.nativeEnum(BuildingStatus),
});

export type BuildingFormData = z.infer<typeof buildingSchema>;
