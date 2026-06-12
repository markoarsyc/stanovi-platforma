import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/FormInput';
import { GradientButton } from '@/components/ui/GradientButton';
import { GradientText } from '@/components/ui/GradientText';
import { login } from '@/lib/api/auth.service';
import { useAuth } from '@/lib/auth/AuthContext';
import { loginSchema, type LoginValues } from '@/lib/auth/schemas';

function parseError(error: unknown): string {
  const err = error as { response?: { status?: number; data?: { message?: string | string[] } } };
  if (err.response?.status === 429) {
    return 'Previše pokušaja. Pokušajte ponovo za 1 minut.';
  }
  if (err.response?.status === 401) {
    return 'Pogrešan email ili lozinka.';
  }
  const message = err.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  if (typeof message === 'string') return message;
  return 'Došlo je do greške. Pokušajte ponovo.';
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { login: authLogin } = useAuth();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const { access_token } = await login(values);
      await authLogin(access_token);
      router.replace('/(tabs)/oglasi' as never);
    } catch (error) {
      setSubmitError(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Zaboravljena lozinka', 'Funkcionalnost uskoro');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={{ height: Math.round(height * 0.46) }} className="relative w-full">
            <Image
              source={require('@/assets/images/hero.png')}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(11,11,18,0.55)', '#0B0B12']}
              locations={[0, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />
            {/* Back arrow */}
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{ position: 'absolute', top: insets.top + 8, left: 16 }}>
              <Ionicons name="arrow-back" size={26} color="hsl(239, 84%, 67%)" />
            </Pressable>
            {/* Title */}
            <View className="absolute inset-x-0 bottom-6 px-6">
              <Text className="font-display text-h1 text-white">Vaš novi dom u</Text>
              <GradientText className="font-display text-h1">srcu Beograda</GradientText>
            </View>
          </View>

          {/* Form */}
          <View className="px-6">
            <Text className="mt-6 text-center font-body text-body-sm text-muted">Dobrodošli</Text>

            <View className="mt-5 gap-4">
              <FormInput
                control={control}
                name="email"
                placeholder="Email adresa"
                icon="mail-outline"
                keyboardType="email-address"
              />
              <FormInput
                control={control}
                name="password"
                placeholder="Lozinka"
                icon="lock-closed-outline"
                secureTextEntry
              />
            </View>

            {submitError ? (
              <Text className="mt-4 text-center font-body text-body-sm text-red-400">{submitError}</Text>
            ) : null}

            <View className="mt-6">
              <GradientButton title="Uloguj se" onPress={handleSubmit(onSubmit)} loading={loading} />
            </View>

            <Pressable onPress={handleForgotPassword} className="mt-4 items-center py-1">
              <Text className="text-center font-body text-body-sm text-muted">Zaboravljena lozinka?</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
