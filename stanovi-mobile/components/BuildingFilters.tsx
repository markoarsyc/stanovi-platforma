import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FormSelect } from '@/components/ui/FormSelect';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { buildingStatusConfig } from '@/constants/statusConfig';
import type { BuildingFilters as BuildingFiltersValue } from '@/lib/api/buildings.service';
import { useLocations } from '@/lib/api/useInvestorPanel';
import type { BuildingStatus } from '@/lib/api/types';

const SEARCH_DEBOUNCE_MS = 500;

type SortOrder = 'newest' | 'oldest';

interface BuildingFiltersProps {
  onApply: (filters: BuildingFiltersValue) => void;
}

const STATUS_OPTIONS = (Object.keys(buildingStatusConfig) as BuildingStatus[]).map(
  (status) => ({ label: buildingStatusConfig[status].label, value: status }),
);

export function BuildingFilters({ onApply }: BuildingFiltersProps) {
  const { data: locations } = useLocations();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [status, setStatus] = useState<BuildingStatus | null>(null);
  const [sort, setSort] = useState<SortOrder>('newest');

  // Free-text search is debounced; selects and sort apply immediately.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    onApply({
      search: debouncedSearch.trim() || undefined,
      locationId: locationId ?? undefined,
      status: status ?? undefined,
      sort,
    });
  }, [onApply, debouncedSearch, locationId, status, sort]);

  const locationOptions = (locations ?? []).map((l) => ({ label: l.name, value: l.id }));

  const filtersActive = Boolean(search || locationId || status);

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
    setLocationId(null);
    setStatus(null);
  };

  const toggleSort = () => setSort((prev) => (prev === 'newest' ? 'oldest' : 'newest'));

  return (
    <View className="gap-3">
      <View
        className="w-full flex-row items-center gap-3 border bg-surface px-5"
        style={{ height: 52, borderRadius: 40, borderColor: '#3A3A63' }}>
        <Ionicons name="search-outline" size={18} color="hsl(239, 84%, 67%)" />
        <TextInput
          className="flex-1 font-body text-body-base text-foreground"
          placeholder="Pretraži po nazivu..."
          placeholderTextColor="#9A9AB0"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <SearchableSelect
        placeholder="Sve opštine"
        searchPlaceholder="Pretraži opštine..."
        icon="location-outline"
        options={locationOptions}
        value={locationId}
        onChange={setLocationId}
      />

      <FormSelect
        placeholder="Svi statusi"
        icon="pricetag-outline"
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
      />

      <Pressable
        onPress={toggleSort}
        className="flex-row items-center gap-2 self-start border px-4 py-2"
        style={({ pressed }) => ({
          borderRadius: 40,
          borderColor: '#3A3A63',
          opacity: pressed ? 0.6 : 1,
        })}>
        <Ionicons name="swap-vertical-outline" size={16} color="hsl(239, 84%, 67%)" />
        <Text className="font-body-medium text-body-sm text-foreground">
          {sort === 'newest' ? 'Prvo najnoviji' : 'Prvo najstariji'}
        </Text>
      </Pressable>

      {filtersActive ? (
        <Pressable
          onPress={handleClear}
          className="flex-row items-center justify-center gap-1.5 py-2"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name="close" size={16} color="#9A9AB0" />
          <Text className="font-body-medium text-body-base text-muted">Ukloni filtere</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
