import React, { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/ui';
import { FormField, FormSelect, FormTextarea } from '@/shared/forms';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Location } from '@/shared/types/entity/location.entity';
import { BuildingStatus } from '@/shared/types/enums/building-status.enum';
import { toInputDate, fromInputDate, todayInputDate } from '@/shared/utils/format';
import { buildingSchema, type BuildingFormData } from './buildingSchema';

interface BuildingFormProps {
  building?: Building;
  locations: Location[];
  onSubmit: (data: Omit<Building, 'id'> | Partial<Omit<Building, 'id'>>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const BuildingForm: React.FC<BuildingFormProps> = ({
  building,
  locations,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const methods = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: building
      ? {
          title: building.title,
          locationId: building.locationId,
          address: building.address,
          description: building.description || '',
          dueDate: toInputDate(building.dueDate),
          status: building.status as BuildingStatus,
        }
      : {
          title: '',
          locationId: 0,
          address: '',
          description: '',
          dueDate: '',
          status: BuildingStatus.PLANNED,
        },
  });

  const today = useMemo(() => todayInputDate(), []);

  const handleValid = (data: BuildingFormData) => {
    onSubmit({
      ...data,
      dueDate: fromInputDate(data.dueDate),
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {building ? 'Izmeni projekat' : 'Dodaj novi projekat'}
        </DialogTitle>
      </DialogHeader>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleValid)} className="mt-4 space-y-4">
          <FormField name="title" placeholder="Naziv projekta" />

          <FormSelect name="locationId" valueAsNumber>
            <option value={0} disabled>
              Izaberite opštinu
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </FormSelect>

          <FormField name="address" placeholder="Adresa (npr. Kneza Mihaila 5)" />

          <FormTextarea name="description" placeholder="Opis projekta" rows={3} />

          <FormField name="dueDate" type="date" min={today} placeholder="Rok završetka" />

          <FormSelect name="status">
            <option value={BuildingStatus.PLANNED}>Planiran</option>
            <option value={BuildingStatus.IN_PROGRESS}>U izgradnji</option>
            <option value={BuildingStatus.COMPLETED}>Završen</option>
          </FormSelect>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Čuvanje...' : building ? 'Sačuvaj izmene' : 'Sačuvaj projekat'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Otkaži
            </Button>
          </div>
        </form>
      </FormProvider>
    </DialogContent>
  );
};
