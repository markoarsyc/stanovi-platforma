import React, { useState, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Location } from '@/shared/types/entity/location.entity';
import { BuildingStatus } from '@/shared/types/enums/building-status.enum';

// Helper: Konvertuj UTC DateTime string u lokalni YYYY-MM-DD format
const utcDateTimeToLocalDateString = (isoString: string | Date): string => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset(); // minuta
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Konvertuj lokalni YYYY-MM-DD string u UTC midnight DateTime
const localDateStringToUtcDateTime = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return utcDate.toISOString();
};

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
          dueDate: utcDateTimeToLocalDateString(building.dueDate),
          status: building.status,
        }
      : emptyFormData
  );

  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

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
    
    // Validate required fields
    if (!formData.title || !formData.locationId || !formData.address || !formData.dueDate) {
      alert('Popunite sva obavezna polja');
      return;
    }

    // Validate dueDate is in future
    if (formData.dueDate < today) {
      alert('Datum mora biti u budućnosti');
      return;
    }

    // Convert local date string to UTC DateTime
    const dueDateISO = localDateStringToUtcDateTime(formData.dueDate);

    onSubmit({
      ...formData,
      dueDate: dueDateISO,
    });
  };

  const inputClass =
    'w-full rounded-lg border border-border bg-secondary py-3 px-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {building ? 'Izmeni projekat' : 'Dodaj novi projekat'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          className={inputClass}
          placeholder="Naziv projekta"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <select
          className={inputClass}
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
        </select>

        <input
          className={inputClass}
          placeholder="Adresa (npr. Kneza Mihaila 5)"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <textarea
          className={inputClass}
          placeholder="Opis projekta"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />

        <input
          className={inputClass}
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          min={today}
          required
        />

        <select
          className={inputClass}
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value={BuildingStatus.PLANNED}>Planiran</option>
          <option value={BuildingStatus.IN_PROGRESS}>U izgradnji</option>
          <option value={BuildingStatus.COMPLETED}>Završen</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-indigo px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-indigo disabled:opacity-50"
          >
            {isSubmitting ? 'Čuvanje...' : building ? 'Sačuvaj izmene' : 'Sačuvaj projekat'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-6 py-3 font-body text-sm text-muted-foreground hover:bg-secondary"
          >
            Otkaži
          </button>
        </div>
      </form>
    </DialogContent>
  );
};
