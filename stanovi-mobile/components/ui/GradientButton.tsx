import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

import { BUTTON_RADIUS, GRADIENT_INDIGO } from '@/constants/gradients';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GradientButton({ title, onPress, loading = false, disabled = false }: GradientButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      // NativeWind's className is unreliable on third-party LinearGradient, so the
      // shape / sizing live in style here to guarantee they apply.
      style={{ width: '100%', borderRadius: BUTTON_RADIUS, overflow: 'hidden', opacity: isDisabled ? 0.6 : 1 }}>
      <LinearGradient
        // RN accepts hsl() color strings directly.
        colors={[...GRADIENT_INDIGO]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          borderRadius: BUTTON_RADIUS,
        }}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="font-body-medium text-button text-primary-foreground">{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
