import { useEffect, useMemo, useState } from 'react';
import { Search, ArrowDownUp, X } from 'lucide-react';
import { Button, Input, Select, SearchableSelect } from '@/shared/components/ui';
import { buildingStatusConfig } from '@/shared/constants/statusConfig';
import { BuildingStatus } from '@/shared/types/enums/building-status.enum';
import { useLocationsList } from '@/pages/investor/hooks/useLocationsList';
import type { BuildingFilters } from '@/api/services/buildings.service';

const SEARCH_DEBOUNCE_MS = 500;

type SortOrder = 'newest' | 'oldest';

interface ListingsFiltersProps {
  onApply: (filters: BuildingFilters) => void;
}

const ListingsFilters = ({ onApply }: ListingsFiltersProps) => {
  const { locations } = useLocationsList();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationId, setLocationId] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');

  // Free-text search is debounced; selects and sort apply immediately.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    onApply({
      search: debouncedSearch.trim() || undefined,
      locationId: locationId ? Number(locationId) : undefined,
      status: (status as BuildingStatus) || undefined,
      sort,
    });
  }, [onApply, debouncedSearch, locationId, status, sort]);

  const filtersActive = Boolean(search || locationId || status);

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
    setLocationId('');
    setStatus('');
  };

  const toggleSort = () =>
    setSort((prev) => (prev === 'newest' ? 'oldest' : 'newest'));

  const locationOptions = useMemo(
    () => locations.map((loc) => ({ value: String(loc.id), label: loc.name })),
    [locations],
  );

  return (
    <div className="mt-10 rounded-xl border border-border bg-secondary/30 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            leadingIcon={Search}
            placeholder="Pretraži po nazivu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <SearchableSelect
            value={locationId}
            onChange={setLocationId}
            options={locationOptions}
            placeholder="Sve opštine"
            searchPlaceholder="Pretraži opštine..."
          />

          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Svi statusi</option>
            {Object.values(BuildingStatus).map((s) => (
              <option key={s} value={s}>
                {buildingStatusConfig[s].label}
              </option>
            ))}
          </Select>
        </div>

        <Button
          variant="secondary"
          onClick={toggleSort}
          className="w-full shrink-0 lg:w-auto"
        >
          <ArrowDownUp size={16} />
          {sort === 'newest' ? 'Prvo najnoviji' : 'Prvo najstariji'}
        </Button>
      </div>

      {filtersActive && (
        <div className="mt-4">
          <Button variant="ghost" onClick={handleClear}>
            <X size={16} />
            Ukloni filtere
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListingsFilters;
