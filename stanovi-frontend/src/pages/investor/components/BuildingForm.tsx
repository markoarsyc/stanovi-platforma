import React, { useState, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Input, Select, Textarea, Button } from '@/shared/components/ui';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Location } from '@/shared/types/entity/location.entity';
import { BuildingStatus } from '@/shared/types/enums/building-status.enum';
import { toInputDate, fromInputDate, todayInputDate } from '@/shared/utils/format';

interface BuildingFormProps {
  building?: Building;
  locations: Location[];
  onSubmit: (data: Omit<Building, 'id'> | Partial<Omit<Building, 'id'>>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const emptyFormData = {
  title: '',
  locationId: 0,
  address: '',
  description: '',
  dueDate: '',
  status: BuildingStatus.PLANNED,
};

export const BuildingForm: React.FC<BuildingFormProps> = ({
  building,
  locations,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState(
    building
      ? {
        title: building.title,
        locationId: building.locationId,
        address: building.address,
        description: building.description || '',
        dueDate: toInputDate(building.dueDate),
        status: building.status,
      }
      : emptyFormData
  );

  const [dateInputType, setDateInputType] = useState<'text' | 'date'>(
    building ? 'date' : 'text'
  );

  const today = useMemo(() => todayInputDate(), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'locationId' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.locationId || !formData.address || !formData.dueDate) {
      alert('Popunite sva obavezna polja');
      return;
    }

    if (formData.dueDate < today) {
      alert('Datum mora biti u budućnosti');
      return;
    }

    onSubmit({
      ...formData,
      dueDate: fromInputDate(formData.dueDate),
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {building ? 'Izmeni projekat' : 'Dodaj novi projekat'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          placeholder="Naziv projekta"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Select
          name="locationId"
          value={formData.locationId || ''}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Izaberite opštinu
          </option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </Select>

        <Input
          placeholder="Adresa (npr. Kneza Mihaila 5)"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <Textarea
          placeholder="Opis projekta"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />

        <Input
          type={dateInputType}
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          onFocus={() => setDateInputType('date')}
          onBlur={(e) => {
            if (!e.target.value) {
              setDateInputType('text');
            }
          }}
          min={today}
          placeholder="Rok završetka"
          required
        />

        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value={BuildingStatus.PLANNED}>Planiran</option>
          <option value={BuildingStatus.IN_PROGRESS}>U izgradnji</option>
          <option value={BuildingStatus.COMPLETED}>Završen</option>
        </Select>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Čuvanje...' : building ? 'Sačuvaj izmene' : 'Sačuvaj projekat'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Otkaži
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
