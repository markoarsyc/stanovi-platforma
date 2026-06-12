import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/FormInput';
import { GradientButton } from '@/components/ui/GradientButton';
import { GRADIENT_INDIGO } from '@/constants/gradients';
import {
  registerBuyerSchema,
  registerInvestorSchema,
  type RegisterBuyerValues,
  type RegisterInvestorValues,
} from '@/lib/auth/schemas';
import { useAuth } from '@/lib/auth/AuthContext';
import { registerBuyer, registerInvestor } from '@/lib/api/auth.service';

type Role = 'BUYER' | 'INVESTOR';

function parseError(error: unknown): string {
  const err = error as { response?: { status?: number; data?: { message?: string | string[] } } };
  if (err.response?.status === 429) {
    return 'Previše pokušaja. Pokušajte ponovo za 1 minut.';
  }
  if (err.response?.status === 409) {
    return 'Nalog sa ovim emailom već postoji.';
  }
  const message = err.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  if (typeof message === 'string') return message;
  return 'Došlo je do greške. Pokušajte ponovo.';
}

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>('BUYER');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buyerForm = useForm<RegisterBuyerValues>({
    resolver: zodResolver(registerBuyerSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', email: '', password: '' },
  });

  const investorForm = useForm<RegisterInvestorValues>({
    resolver: zodResolver(registerInvestorSchema),
    defaultValues: {
      companyName: '',
      tin: '',
      contactEmail: '',
      contactPhone: '',
      email: '',
      password: '',
    },
  });

  const onBuyerSubmit = async (values: RegisterBuyerValues) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const { access_token } = await registerBuyer(values);
      await login(access_token);
      router.replace('/(tabs)/oglasi' as never);
    } catch (error) {
      setSubmitError(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  const onInvestorSubmit = async (values: RegisterInvestorValues) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const { access_token } = await registerInvestor({
        ...values,
        tin: values.tin ? values.tin : undefined,
      });
      await login(access_token);
      router.replace('/(tabs)/oglasi' as never);
    } catch (error) {
      setSubmitError(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit =
    role === 'BUYER'
      ? buyerForm.handleSubmit(onBuyerSubmit)
      : investorForm.handleSubmit(onInvestorSubmit);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="px-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back arrow */}
          <Pressable onPress={() => router.back()} hitSlop={12} className="mt-2 h-10 w-10 justify-center">
            <Ionicons name="arrow-back" size={26} color="hsl(239, 84%, 67%)" />
          </Pressable>

          {/* Header */}
          <Text className="mt-2 text-center font-display text-h2 text-foreground">Registracija</Text>
          <Text className="mt-1 text-center font-body text-body-sm text-muted">
            Postanite deo Indigo zajednice
          </Text>

          {/* Role toggle */}
          <View className="mt-6 flex-row gap-3">
            <RoleSegment
              label="Kupac"
              icon="person-outline"
              active={role === 'BUYER'}
              onPress={() => {
                setRole('BUYER');
                setSubmitError(null);
              }}
            />
            <RoleSegment
              label="Investitor"
              icon="business-outline"
              active={role === 'INVESTOR'}
              onPress={() => {
                setRole('INVESTOR');
                setSubmitError(null);
              }}
            />
          </View>

          {/* Fields — keyed by role so switching remounts the inputs cleanly
              (prevents RHF Controllers from re-registering onto swapped control/name) */}
          <View key={role} className="mt-6 gap-4">
            {role === 'BUYER' ? (
              <>
                <FormInput control={buyerForm.control} name="firstName" placeholder="Ime" icon="person-outline" autoCapitalize="words" />
                <FormInput control={buyerForm.control} name="lastName" placeholder="Prezime" icon="person-outline" autoCapitalize="words" />
                <FormInput control={buyerForm.control} name="phone" placeholder="Telefon" icon="call-outline" keyboardType="phone-pad" />
                <FormInput control={buyerForm.control} name="email" placeholder="Email adresa" icon="mail-outline" keyboardType="email-address" />
                <FormInput control={buyerForm.control} name="password" placeholder="Lozinka" icon="lock-closed-outline" secureTextEntry />
              </>
            ) : (
              <>
                <FormInput control={investorForm.control} name="companyName" placeholder="Naziv firme" icon="business-outline" autoCapitalize="words" />
                <FormInput control={investorForm.control} name="tin" placeholder="PIB (Opciono)" icon="pricetag-outline" keyboardType="number-pad" />
                <FormInput control={investorForm.control} name="contactEmail" placeholder="Email firme" icon="mail-outline" keyboardType="email-address" />
                <FormInput control={investorForm.control} name="contactPhone" placeholder="Telefon firme" icon="call-outline" keyboardType="phone-pad" />
                <FormInput control={investorForm.control} name="email" placeholder="Email adresa" icon="mail-outline" keyboardType="email-address" />
                <FormInput control={investorForm.control} name="password" placeholder="Lozinka" icon="lock-closed-outline" secureTextEntry />
              </>
            )}
          </View>

          {submitError ? (
            <Text className="mt-4 text-center font-body text-body-sm text-red-400">{submitError}</Text>
          ) : null}

          {/* Submit */}
          <View className="mt-6">
            <GradientButton title="Registruj se" onPress={onSubmit} loading={loading} />
          </View>

          {/* Footer */}
          <View className="mt-5 flex-row justify-center">
            <Text className="font-body text-body-sm text-muted">Već imaš nalog? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login' as never)}>
              <Text className="font-body-medium text-body-sm text-primary">Prijavi se</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface RoleSegmentProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}

function RoleSegment({ label, icon, active, onPress }: RoleSegmentProps) {
  const content = (
    <View className="flex-row items-center justify-center gap-2">
      <Ionicons name={icon} size={16} color={active ? '#ffffff' : 'hsl(239, 84%, 67%)'} />
      <Text
        className={`font-body-medium text-button ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable onPress={onPress} className="flex-1" style={{ borderRadius: 40, overflow: 'hidden' }}>
      {active ? (
        <LinearGradient
          colors={[...GRADIENT_INDIGO]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 40 }}>
          {content}
        </LinearGradient>
      ) : (
        <View
          className="items-center justify-center border bg-surface"
          style={{ height: 48, borderRadius: 40, borderColor: '#3A3A63' }}>
          {content}
        </View>
      )}
    </Pressable>
  );
}
