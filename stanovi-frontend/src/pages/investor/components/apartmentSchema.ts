import { z } from 'zod';
import { ApartmentStatus } from '@/shared/types/enums/apartment-status.enum';

export const apartmentSchema = z.object({
  buildingId: z.string().min(1),
  aptNo: z.string().min(1, 'Broj stana je obavezan'),
  floor: z
    .number({ invalid_type_error: 'Sprat je obavezan' })
    .int()
    .min(0, 'Sprat ne može biti negativan'),
  rooms: z
    .number({ invalid_type_error: 'Broj soba je obavezan' })
    .positive('Broj soba mora biti veći od 0'),
  area: z
    .number({ invalid_type_error: 'Površina je obavezna' })
    .positive('Površina mora biti veća od 0'),
  price: z
    .number({ invalid_type_error: 'Cena je obavezna' })
    .positive('Cena mora biti veća od 0'),
  status: z.nativeEnum(ApartmentStatus),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;
