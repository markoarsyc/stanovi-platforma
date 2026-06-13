import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export interface SelectOption<T> {
  label: string;
  value: T;
}

interface FormSelectProps<T> {
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: SelectOption<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  error?: string;
}

export function FormSelect<T extends string | number>({
  placeholder,
  icon,
  options,
  value,
  onChange,
  error,
}: FormSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="w-full">
      <Pressable
        onPress={() => setOpen(true)}
        className="w-full flex-row items-center gap-3 border bg-surface px-5"
        style={{ height: 52, borderRadius: 40, borderColor: error ? '#F87171' : '#3A3A63' }}>
        <Ionicons name={icon} size={18} color="hsl(239, 84%, 67%)" />
        <Text
          className={`flex-1 font-body text-body-base ${selected ? 'text-foreground' : 'text-muted'}`}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9A9AB0" />
      </Pressable>

      {error ? (
        <Text className="mt-1 px-5 font-body text-body-sm text-red-400">{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-center bg-black/60 px-8"
          onPress={() => setOpen(false)}>
          <Pressable className="overflow-hidden rounded-3xl bg-surface" onPress={() => {}}>
            <Text className="px-5 pb-2 pt-4 font-display text-h3 text-foreground">
              {placeholder}
            </Text>
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex-row items-center justify-between border-t px-5 py-4"
                  style={{ borderTopColor: '#2A2A40' }}>
                  <Text
                    className={`font-body text-body-base ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </Text>
                  {isActive ? (
                    <Ionicons name="checkmark" size={20} color="hsl(239, 84%, 67%)" />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
