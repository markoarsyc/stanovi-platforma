import { z } from 'zod';

const BUILDING_STATUS = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as const;
const APARTMENT_STATUS = ['AVAILABLE', 'RESERVED'] as const;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const buildingSchema = z.object({
  title: z.string().min(1, 'Naziv projekta je obavezan'),
  locationId: z.number().int().positive('Izaberite opštinu'),
  address: z.string().min(1, 'Adresa je obavezna'),
  description: z.string().optional().or(z.literal('')),
  // ISO date string (yyyy-mm-dd) chosen via the date picker.
  dueDate: z
    .string()
    .min(1, 'Rok završetka je obavezan')
    .refine((d) => new Date(d) >= startOfToday(), 'Datum mora biti u budućnosti'),
  status: z.enum(BUILDING_STATUS),
});

export type BuildingFormValues = z.infer<typeof buildingSchema>;

export const apartmentSchema = z.object({
  aptNo: z.string().min(1, 'Broj stana je obavezan'),
  floor: z
    .number({ message: 'Sprat je obavezan' })
    .int('Sprat mora biti ceo broj')
    .min(0, 'Sprat ne može biti negativan'),
  rooms: z
    .number({ message: 'Broj soba je obavezan' })
    .int('Broj soba mora biti ceo broj')
    .positive('Broj soba mora biti veći od 0'),
  area: z.number({ message: 'Površina je obavezna' }).positive('Površina mora biti veća od 0'),
  price: z.number({ message: 'Cena je obavezna' }).positive('Cena mora biti veća od 0'),
  status: z.enum(APARTMENT_STATUS),
});

export type ApartmentFormValues = z.infer<typeof apartmentSchema>;
