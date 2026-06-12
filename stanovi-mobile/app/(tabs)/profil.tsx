import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GRADIENT_INDIGO } from '@/constants/gradients';
import { useBuyerProfile, useInvestorProfile } from '@/lib/api/useProfile';
import { useAuth } from '@/lib/auth/AuthContext';

type IoniconName = keyof typeof Ionicons.glyphMap;

export default function ProfilScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isInvestor, logout } = useAuth();

  const buyerQuery = useBuyerProfile(user?.id, !isInvestor);
  const investorQuery = useInvestorProfile(user?.id, isInvestor);

  const isLoading = isInvestor ? investorQuery.isLoading : buyerQuery.isLoading;
  const buyer = buyerQuery.data;
  const investor = investorQuery.data;

  const roleLabel = isInvestor ? 'Investitor' : 'Kupac';
  const displayName = isInvestor
    ? investor?.companyName || 'Investitor'
    : buyer
      ? `${buyer.firstName} ${buyer.lastName}`
      : 'Kupac';
  const initial = (displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const handleLogout = () => {
    Alert.alert('Odjava', 'Da li ste sigurni da želite da se odjavite?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Odjavi se',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)' as never);
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="person-circle-outline" size={64} color="#9A9AB0" />
          <Text className="mt-4 text-center font-display text-h3 text-foreground">
            Još uvek nemate korisnički nalog?
          </Text>
          <Text className="mt-2 text-center font-body text-body-base text-muted">
            Registrujte se ili prijavite.
          </Text>

          <View className="mt-8 w-full gap-3">
            <Pressable
              onPress={() => router.push('/(auth)/login' as never)}
              className="h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
              <Ionicons name="log-in-outline" size={20} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-body-base text-primary">Prijavi se</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(auth)/register' as never)}
              className="h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
              <Ionicons name="person-add-outline" size={20} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-body-base text-primary">Registruj se</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-6 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <Text className="font-display text-h1 text-white">Profil</Text>

        {/* Header */}
        <View className="mt-6 flex-row items-center gap-4">
          <View className="relative">
            <LinearGradient
              colors={GRADIENT_INDIGO}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 72, width: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
              <Text className="font-display text-h2 text-white">{initial}</Text>
            </LinearGradient>
            {isInvestor && investor?.isVerified ? (
              <View
                className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5"
                style={{ padding: 2 }}>
                <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
              </View>
            ) : null}
          </View>

          <View className="flex-1">
            <Text className="font-display text-h3 text-foreground" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="font-body text-body-sm text-muted">{roleLabel}</Text>
          </View>
        </View>

        {/* Info */}
        {isLoading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="hsl(239, 84%, 67%)" />
          </View>
        ) : (
          <View className="mt-8 gap-3">
            {isInvestor ? (
              <>
                <InfoRow icon="business-outline" label="Naziv kompanije" value={investor?.companyName} />
                <InfoRow icon="pricetag-outline" label="PIB" value={investor?.tin} />
                <InfoRow icon="mail-outline" label="Kontakt email" value={investor?.contactEmail} />
                <InfoRow icon="call-outline" label="Kontakt telefon" value={investor?.contactPhone} />
                <InfoRow
                  icon={investor?.isVerified ? 'shield-checkmark-outline' : 'shield-outline'}
                  label="Status verifikacije"
                  value={investor?.isVerified ? 'Verifikovan' : 'Nije verifikovan'}
                />
              </>
            ) : (
              <>
                <InfoRow icon="person-outline" label="Ime" value={buyer?.firstName} />
                <InfoRow icon="person-outline" label="Prezime" value={buyer?.lastName} />
                <InfoRow icon="mail-outline" label="Email" value={user?.email} />
                <InfoRow icon="call-outline" label="Telefon" value={buyer?.phone} />
              </>
            )}
          </View>
        )}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mt-10 h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="font-body-medium text-body-base" style={{ color: '#f87171' }}>
            Odjavi se
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: IoniconName; label: string; value?: string | null }) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
      <Ionicons name={icon} size={20} color="hsl(239, 84%, 67%)" />
      <View className="flex-1">
        <Text className="font-body text-body-sm uppercase tracking-wide text-muted">{label}</Text>
        <Text className="font-body text-body-base text-foreground">{value || '—'}</Text>
      </View>
    </View>
  );
}
