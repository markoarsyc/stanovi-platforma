import { Ionicons } from '@expo/vector-icons';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { KeyboardTypeOptions, Text, TextInput, View } from 'react-native';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // When true the field value is coerced to a number (empty string → undefined),
  // so zod number schemas validate correctly.
  numeric?: boolean;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  numeric = false,
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="w-full">
          <View
            className="w-full flex-row items-center gap-3 border bg-surface px-5"
            style={{ height: 52, borderRadius: 40, borderColor: error ? '#F87171' : '#3A3A63' }}>
            <Ionicons name={icon} size={18} color="hsl(239, 84%, 67%)" />
            <TextInput
              className="flex-1 font-body text-body-base text-foreground"
              placeholder={placeholder}
              placeholderTextColor="#9A9AB0"
              value={value === undefined || value === null ? '' : String(value)}
              onChangeText={
                numeric
                  ? (text) => {
                      const cleaned = text.replace(',', '.');
                      onChange(cleaned === '' ? undefined : Number(cleaned));
                    }
                  : onChange
              }
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType ?? (numeric ? 'numeric' : undefined)}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
            />
          </View>
          {error ? (
            <Text className="mt-1 px-5 font-body text-body-sm text-red-400">{error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
