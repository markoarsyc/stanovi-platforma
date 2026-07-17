import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';

import type { SelectOption } from '@/components/ui/FormSelect';

interface SearchableSelectProps<T> {
  /** Label for the empty (reset) selection — shown on the trigger and as the top row. */
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: SelectOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  /** Offers the placeholder as a row that resets the selection. Off for required fields. */
  allowClear?: boolean;
  error?: string;
}

export function SearchableSelect<T extends string | number>({
  placeholder,
  searchPlaceholder = 'Pretraži...',
  emptyText = 'Nema rezultata',
  icon,
  options,
  value,
  onChange,
  allowClear = true,
  error,
}: SearchableSelectProps<T>) {
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const handleOpen = () => {
    setQuery('');
    setOpen(true);
  };

  const handleSelect = (val: T | null) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <View className="w-full">
      <Pressable
        onPress={handleOpen}
        className="w-full flex-row items-center gap-3 border bg-surface px-5"
        style={{ height: 52, borderRadius: 40, borderColor: error ? '#F87171' : '#3A3A63' }}>
        <Ionicons name={icon} size={18} color="hsl(239, 84%, 67%)" />
        <Text
          className={`flex-1 font-body text-body-base ${selected ? 'text-foreground' : 'text-muted'}`}
          numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9A9AB0" />
      </Pressable>

      {error ? (
        <Text className="mt-1 px-5 font-body text-body-sm text-red-400">{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Anchored to a fixed offset so the search box never shifts as the list shrinks. */}
        <Pressable
          className="flex-1 bg-black/60 px-8"
          style={{ paddingTop: height * 0.2 }}
          onPress={() => setOpen(false)}>
          <Pressable
            className="overflow-hidden rounded-3xl bg-surface"
            style={{ maxHeight: height * 0.6 }}
            onPress={() => {}}>
            <Text className="px-5 pb-3 pt-4 font-display text-h3 text-foreground">
              {placeholder}
            </Text>

            <View className="px-5 pb-3">
              <View
                className="flex-row items-center gap-2 border bg-background px-4"
                style={{ height: 44, borderRadius: 40, borderColor: '#3A3A63' }}>
                <Ionicons name="search-outline" size={16} color="#9A9AB0" />
                <TextInput
                  className="flex-1 font-body text-body-base text-foreground"
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#9A9AB0"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {query ? (
                  <Pressable onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color="#9A9AB0" />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(option) => String(option.value)}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                allowClear && !query.trim() ? (
                  <OptionRow
                    label={placeholder}
                    active={value === null || value === undefined}
                    onPress={() => handleSelect(null)}
                  />
                ) : null
              }
              ListEmptyComponent={
                <Text className="px-5 py-4 font-body text-body-base text-muted">{emptyText}</Text>
              }
              renderItem={({ item }) => (
                <OptionRow
                  label={item.label}
                  active={item.value === value}
                  onPress={() => handleSelect(item.value)}
                />
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function OptionRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between gap-2 border-t px-5 py-4"
      style={({ pressed }) => ({
        borderTopColor: '#2A2A40',
        opacity: pressed ? 0.6 : 1,
      })}>
      <Text
        className={`flex-1 font-body text-body-base ${active ? 'text-primary' : 'text-foreground'}`}
        numberOfLines={1}>
        {label}
      </Text>
      {active ? <Ionicons name="checkmark" size={20} color="hsl(239, 84%, 67%)" /> : null}
    </Pressable>
  );
}
