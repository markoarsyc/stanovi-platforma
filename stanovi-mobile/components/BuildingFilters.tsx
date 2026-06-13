import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FormSelect } from '@/components/ui/FormSelect';
import { GradientButton } from '@/components/ui/GradientButton';
import { buildingStatusConfig } from '@/constants/statusConfig';
import type { BuildingFilters as BuildingFiltersValue } from '@/lib/api/buildings.service';
import { useLocations } from '@/lib/api/useInvestorPanel';
import type { BuildingStatus } from '@/lib/api/types';

interface BuildingFiltersProps {
  onApply: (filters: BuildingFiltersValue) => void;
  onClear: () => void;
  filtersApplied: boolean;
}

const STATUS_OPTIONS = (Object.keys(buildingStatusConfig) as BuildingStatus[]).map(
  (status) => ({ label: buildingStatusConfig[status].label, value: status }),
);

const SORT_OPTIONS: { label: string; value: 'newest' | 'oldest' }[] = [
  { label: 'Najnovije', value: 'newest' },
  { label: 'Najstarije', value: 'oldest' },
];

export function BuildingFilters({ onApply, onClear, filtersApplied }: BuildingFiltersProps) {
  const { data: locations } = useLocations();

  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [status, setStatus] = useState<BuildingStatus | null>(null);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const locationOptions = (locations ?? []).map((l) => ({ label: l.name, value: l.id }));

  const handleApply = () => {
    onApply({
      search: search.trim() || undefined,
      locationId: locationId ?? undefined,
      status: status ?? undefined,
      sort,
    });
  };

  const handleClear = () => {
    setSearch('');
    setLocationId(null);
    setStatus(null);
    setSort('newest');
    onClear();
  };

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

      <FormSelect
        placeholder="Sve opštine"
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

      <FormSelect
        placeholder="Sortiranje"
        icon="swap-vertical-outline"
        options={SORT_OPTIONS}
        value={sort}
        onChange={setSort}
      />

      <GradientButton title="Primeni filtere" onPress={handleApply} />

      {filtersApplied ? (
        <Pressable onPress={handleClear} className="items-center py-2">
          <Text className="font-body-medium text-body-base text-muted">Ukloni filtere</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
