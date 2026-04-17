import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import type { Apartment } from '@/shared/types/entity/apartment.entity';
import { ApartmentStatus } from '@/shared/types/enums/apartment-status.enum';

interface ApartmentFormProps {
  buildingId: string;
  apartment?: Apartment;
  onSubmit: (data: Omit<Apartment, 'id'> | Partial<Omit<Apartment, 'id'>>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const emptyFormData = {
  buildingId: '',
  aptNo: '',
  floor: '',
  rooms: '',
  area: '',
  price: '',
  status: ApartmentStatus.AVAILABLE,
};

export const ApartmentForm: React.FC<ApartmentFormProps> = ({
  buildingId,
  apartment,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState(
    apartment
      ? {
          buildingId: apartment.buildingId,
          aptNo: apartment.aptNo,
          floor: String(apartment.floor),
          rooms: String(apartment.rooms),
          area: String(apartment.area),
          price: String(apartment.price),
          status: apartment.status,
        }
      : { ...emptyFormData, buildingId }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.aptNo || !formData.floor || !formData.rooms || !formData.area || !formData.price) {
      alert('Popunite sva obavezna polja');
      return;
    }

    // Validate numeric fields
    const floor = Number(formData.floor);
    const rooms = Number(formData.rooms);
    const area = Number(formData.area);
    const price = Number(formData.price);

    if (floor < 0 || rooms <= 0 || area <= 0 || price <= 0) {
      alert('Proveri unete vrednosti - ne mogu biti 0 ili negativne');
      return;
    }

    // For update, don't include buildingId since it's read-only
    const submitData = apartment
      ? {
          aptNo: formData.aptNo,
          floor,
          rooms,
          area,
          price,
          status: formData.status,
        }
      : {
          buildingId: formData.buildingId,
          aptNo: formData.aptNo,
          floor,
          rooms,
          area,
          price,
          status: formData.status,
        };

    onSubmit(submitData);
  };

  const inputClass =
    'w-full rounded-lg border border-border bg-secondary py-3 px-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          {apartment ? 'Izmeni stan' : 'Dodaj stan'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          className={inputClass}
          placeholder="Broj stana (npr. 1, 2A, 3B)"
          name="aptNo"
          value={formData.aptNo}
          onChange={handleChange}
          required
        />

        <input
          className={inputClass}
          placeholder="Sprat"
          type="number"
          name="floor"
          min="0"
          value={formData.floor}
          onChange={handleChange}
          required
        />

        <input
          className={inputClass}
          placeholder="Broj soba"
          type="number"
          name="rooms"
          min="1"
          value={formData.rooms}
          onChange={handleChange}
          required
        />

        <input
          className={inputClass}
          placeholder="Površina (m²)"
          type="number"
          name="area"
          min="1"
          step="0.01"
          value={formData.area}
          onChange={handleChange}
          required
        />

        <input
          className={inputClass}
          placeholder="Cena (€)"
          type="number"
          name="price"
          min="1"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <select
          className={inputClass}
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value={ApartmentStatus.AVAILABLE}>Dostupan</option>
          <option value={ApartmentStatus.RESERVED}>Rezervisan</option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-indigo py-3 font-body text-sm font-semibold text-primary-foreground shadow-indigo disabled:opacity-50"
        >
          {isSubmitting ? 'Čuvanje...' : apartment ? 'Sačuvaj izmene' : 'Dodaj stan'}
        </button>
      </form>
    </DialogContent>
  );
};
