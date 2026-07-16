import React from 'react';
import { Pencil, Trash2, Home, ImageIcon, Images, Box } from 'lucide-react';
import ApartmentViewToggle from '@/shared/components/ApartmentViewToggle';
import type { Apartment } from '@/shared/types/entity/apartment.entity';
import { apartmentStatusConfig } from '@/shared/constants/statusConfig';
import { formatPrice } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

interface ApartmentListProps {
  apartments: Apartment[];
  view: 'list' | 'cards';
  onViewChange: (view: 'list' | 'cards') => void;
  onEdit: (apartment: Apartment) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onManageImages?: (apartment: Apartment) => void;
  onManageModel?: (apartment: Apartment) => void;
}

interface ApartmentActionsProps {
  apartment: Apartment;
  onManageImages?: (apartment: Apartment) => void;
  onManageModel?: (apartment: Apartment) => void;
  onEdit: (apartment: Apartment) => void;
  onDelete: (id: string) => void;
}

const actionBtnClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary';

const ApartmentActions: React.FC<ApartmentActionsProps> = ({
  apartment,
  onManageImages,
  onManageModel,
  onEdit,
  onDelete,
}) => {
  const hasModel = !!apartment.model;
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onManageImages?.(apartment)}
        className={cn(actionBtnClass, 'hover:text-primary')}
        title="Upravljaj slikama"
      >
        <Images size={16} />
      </button>
      <button
        onClick={() => onManageModel?.(apartment)}
        className={cn(
          actionBtnClass,
          hasModel
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'hover:text-primary',
        )}
        title={hasModel ? 'Upravljaj 3D modelom (postavljen)' : 'Dodaj 3D model'}
      >
        <Box size={16} />
      </button>
      <button
        onClick={() => onEdit(apartment)}
        className={cn(actionBtnClass, 'hover:text-primary')}
        title="Izmeni"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => onDelete(apartment.id)}
        className={cn(actionBtnClass, 'hover:text-destructive')}
        title="Obriši"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export const ApartmentList: React.FC<ApartmentListProps> = ({
  apartments,
  view,
  onViewChange,
  onEdit,
  onDelete,
  onAddNew,
  onManageImages,
  onManageModel,
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Home size={16} /> Stanovi ({apartments.length})
        </h4>
        <div className="flex items-center gap-2">
          <ApartmentViewToggle view={view} onChange={onViewChange} />
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-4 py-2 font-body text-xs font-semibold text-primary hover:bg-primary/20"
          >
            <span>+</span> Dodaj stan
          </button>
        </div>
      </div>

      {apartments.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">Nema dodanih stanova.</p>
      ) : view === 'list' ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3.5 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Br.
                </th>
                <th className="px-4 py-3.5 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Sprat
                </th>
                <th className="px-4 py-3.5 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Sobe
                </th>
                <th className="px-4 py-3.5 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  m²
                </th>
                <th className="px-4 py-3.5 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Cena
                </th>
                <th className="px-4 py-3.5 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3.5 text-right font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-4 font-body text-sm font-medium text-foreground">{apt.aptNo}</td>
                  <td className="px-4 py-4 font-body text-sm text-muted-foreground">{apt.floor}.</td>
                  <td className="px-4 py-4 font-body text-sm text-muted-foreground">{apt.rooms}</td>
                  <td className="px-4 py-4 font-body text-sm text-muted-foreground">{apt.area}</td>
                  <td className="px-4 py-4 font-body text-sm font-semibold text-accent">
                    {formatPrice(apt.price)}
                  </td>
                  <td className="px-4 py-4 font-body text-sm text-muted-foreground">
                    {apartmentStatusConfig[apt.status].label}
                  </td>
                  <td className="px-4 py-4">
                    <ApartmentActions
                      apartment={apt}
                      onManageImages={onManageImages}
                      onManageModel={onManageModel}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apt) => (
            <div key={apt.id} className="overflow-hidden rounded-xl border border-border bg-secondary/30">
              <div className="aspect-4/3 bg-secondary flex items-center justify-center">
                {apt.images?.[0]?.imageUrl ? (
                  <img
                    src={apt.images[0].imageUrl}
                    alt="Plan"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={40} className="text-muted-foreground/40" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-foreground">Stan {apt.aptNo}</h3>
                  <ApartmentActions
                    apartment={apt}
                    onManageImages={onManageImages}
                    onManageModel={onManageModel}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Sprat {apt.floor}. · {apt.rooms} sobe · {apt.area} m² ·{' '}
                  <span>{apartmentStatusConfig[apt.status].label}</span>
                </p>
                <p className="mt-1 font-body text-sm font-semibold text-accent">
                  {formatPrice(apt.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
