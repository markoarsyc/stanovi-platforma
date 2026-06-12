import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/ui';
import { FormField, FormSelect } from '@/shared/forms';
import type { Apartment } from '@/shared/types/entity/apartment.entity';
import { ApartmentStatus } from '@/shared/types/enums/apartment-status.enum';
import { apartmentSchema, type ApartmentFormData } from './apartmentSchema';

interface ApartmentFormProps {
  buildingId: string;
  apartment?: Apartment;
  onSubmit: (data: Omit<Apartment, 'id'> | Partial<Omit<Apartment, 'id'>>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ApartmentForm: React.FC<ApartmentFormProps> = ({
  buildingId,
  apartment,
  onSubmit,
  isSubmitting,
}) => {
  const methods = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: apartment
      ? {
          buildingId: apartment.buildingId,
          aptNo: apartment.aptNo,
          floor: apartment.floor,
          rooms: apartment.rooms,
          area: apartment.area,
          price: apartment.price,
          status: apartment.status as ApartmentStatus,
        }
      : {
          buildingId,
          aptNo: '',
          floor: undefined,
          rooms: undefined,
          area: undefined,
          price: undefined,
          status: ApartmentStatus.AVAILABLE,
        },
  });

  const handleValid = (data: ApartmentFormData) => {
    if (apartment) {
      const { buildingId: _ignore, ...rest } = data;
      void _ignore;
      onSubmit(rest);
    } else {
      onSubmit(data);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          {apartment ? 'Izmeni stan' : 'Dodaj stan'}
        </DialogTitle>
      </DialogHeader>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleValid)} className="mt-4 space-y-4">
          <FormField name="aptNo" placeholder="Broj stana (npr. 1, 2A, 3B)" />
          <FormField name="floor" type="number" min="0" placeholder="Sprat" valueAsNumber />
          <FormField name="rooms" type="number" min="1" placeholder="Broj soba" valueAsNumber />
          <FormField name="area" type="number" min="1" step="0.01" placeholder="Površina (m²)" valueAsNumber />
          <FormField name="price" type="number" min="1" step="0.01" placeholder="Cena (€)" valueAsNumber />

          <FormSelect name="status">
            <option value={ApartmentStatus.AVAILABLE}>Dostupan</option>
            <option value={ApartmentStatus.RESERVED}>Rezervisan</option>
          </FormSelect>

          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'Čuvanje...' : apartment ? 'Sačuvaj izmene' : 'Dodaj stan'}
          </Button>
        </form>
      </FormProvider>
    </DialogContent>
  );
};
