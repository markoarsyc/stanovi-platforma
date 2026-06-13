import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button, Input, Select } from '@/shared/components/ui';
import { buildingStatusConfig } from '@/shared/constants/statusConfig';
import { BuildingStatus } from '@/shared/types/enums/building-status.enum';
import { useLocationsList } from '@/pages/investor/hooks/useLocationsList';
import type { BuildingFilters } from '@/api/services/buildings.service';

interface ListingsFiltersProps {
  onApply: (filters: BuildingFilters) => void;
  onClear: () => void;
  filtersApplied: boolean;
  loading?: boolean;
}

const emptyDraft = {
  search: '',
  locationId: '',
  status: '',
  sort: 'newest' as 'newest' | 'oldest',
};

const ListingsFilters = ({
  onApply,
  onClear,
  filtersApplied,
  loading,
}: ListingsFiltersProps) => {
  const { locations } = useLocationsList();
  const [draft, setDraft] = useState(emptyDraft);

  const handleApply = () => {
    onApply({
      search: draft.search.trim() || undefined,
      locationId: draft.locationId ? Number(draft.locationId) : undefined,
      status: (draft.status as BuildingStatus) || undefined,
      sort: draft.sort,
    });
  };

  const handleClear = () => {
    setDraft(emptyDraft);
    onClear();
  };

  return (
    <div className="mt-10 rounded-xl border border-border bg-secondary/30 p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          leadingIcon={Search}
          placeholder="Pretraži po nazivu..."
          value={draft.search}
          onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
        />

        <Select
          value={draft.locationId}
          onChange={(e) =>
            setDraft((d) => ({ ...d, locationId: e.target.value }))
          }
        >
          <option value="">Sve opštine</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </Select>

        <Select
          value={draft.status}
          onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
        >
          <option value="">Svi statusi</option>
          {Object.values(BuildingStatus).map((status) => (
            <option key={status} value={status}>
              {buildingStatusConfig[status].label}
            </option>
          ))}
        </Select>

        <Select
          value={draft.sort}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              sort: e.target.value as 'newest' | 'oldest',
            }))
          }
        >
          <option value="newest">Najnovije</option>
          <option value="oldest">Najstarije</option>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={handleApply} disabled={loading}>
          <SlidersHorizontal size={16} />
          Primeni filtere
        </Button>
        {filtersApplied && (
          <Button variant="ghost" onClick={handleClear} disabled={loading}>
            <X size={16} />
            Ukloni filtere
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListingsFilters;
