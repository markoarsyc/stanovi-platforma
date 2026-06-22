import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { EditBuyerModal } from '@/components/profile/EditBuyerModal';
import { EditInvestorModal } from '@/components/profile/EditInvestorModal';
import { ReservationsList } from '@/components/profile/ReservationsList';
import { GradientButton } from '@/components/ui/GradientButton';
import { GRADIENT_INDIGO } from '@/constants/gradients';
import { useBuyerProfile, useInvestorProfile, useProfileMutations } from '@/lib/api/useProfile';
import { useAuth } from '@/lib/auth/AuthContext';
import { pickImages } from '@/lib/investor/imagePicker';

type IoniconName = keyof typeof Ionicons.glyphMap;

export default function ProfilScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <GuestProfile />;
  }

  return <AuthenticatedProfile />;
}

function AuthenticatedProfile() {
  const router = useRouter();
  const { user, isInvestor, logout } = useAuth();

  const buyerQuery = useBuyerProfile(user?.id, !isInvestor);
  const investorQuery = useInvestorProfile(user?.id, isInvestor);
  const { uploadPhoto, removePhoto } = useProfileMutations(user?.id, isInvestor);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

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

  const profileId = isInvestor ? investor?.id : buyer?.id;
  const photoUrl = isInvestor ? investor?.profilePhotoUrl : buyer?.profilePhotoUrl;
  const hasProfile = isInvestor ? !!investor : !!buyer;

  const pickAndUpload = async () => {
    if (!profileId) return;
    const uris = await pickImages(false);
    if (!uris.length) return;
    try {
      await uploadPhoto.mutateAsync({ id: profileId, uri: uris[0] });
    } catch {
      Alert.alert('Greška', 'Otpremanje slike nije uspelo. Pokušajte ponovo.');
    }
  };

  const removeCurrentPhoto = async () => {
    if (!profileId) return;
    try {
      await removePhoto.mutateAsync({ id: profileId });
    } catch {
      Alert.alert('Greška', 'Uklanjanje slike nije uspelo. Pokušajte ponovo.');
    }
  };

  const handleAvatarPress = () => {
    if (!profileId) return;
    if (!photoUrl) {
      pickAndUpload();
      return;
    }
    Alert.alert('Profilna slika', undefined, [
      { text: 'Izaberi novu sliku', onPress: pickAndUpload },
      { text: 'Ukloni sliku', style: 'destructive', onPress: removeCurrentPhoto },
      { text: 'Otkaži', style: 'cancel' },
    ]);
  };

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-6 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <Text className="font-display text-h1 text-white">Profil</Text>

        {/* Header */}
        <View className="mt-6 flex-row items-center gap-4">
          <Pressable
            onPress={handleAvatarPress}
            disabled={!hasProfile}
            className="relative active:opacity-80">
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ height: 72, width: 72, borderRadius: 999 }}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={GRADIENT_INDIGO}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 72, width: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <Text className="font-display text-h2 text-white">{initial}</Text>
              </LinearGradient>
            )}
            {hasProfile ? (
              <View
                className="absolute -bottom-1 -right-1 rounded-full border-2 border-background bg-surface"
                style={{ padding: 4 }}>
                <Ionicons name="camera" size={14} color="hsl(239, 84%, 67%)" />
              </View>
            ) : null}
            {isInvestor && investor?.isVerified ? (
              <View
                className="absolute -left-1 -top-1 rounded-full bg-background"
                style={{ padding: 2 }}>
                <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
              </View>
            ) : null}
          </Pressable>

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

        {/* Reservations (buyers only) */}
        {!isInvestor ? <ReservationsList enabled={hasProfile} /> : null}

        {/* Edit profile */}
        {hasProfile ? (
          <>
            <Pressable
              onPress={() => setEditOpen(true)}
              className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
              <Ionicons name="create-outline" size={20} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-body-base text-primary">Izmeni profil</Text>
            </Pressable>

            <Pressable
              onPress={() => setPasswordOpen(true)}
              className="mt-3 h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
              <Ionicons name="lock-closed-outline" size={20} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-body-base text-primary">Promeni lozinku</Text>
            </Pressable>
          </>
        ) : null}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mt-3 h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="font-body-medium text-body-base" style={{ color: '#f87171' }}>
            Odjavi se
          </Text>
        </Pressable>

        {/* About / replay the intro */}
        <Pressable
          onPress={() => router.push('/(onboarding)' as never)}
          className="mt-3 h-14 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface active:opacity-80">
          <Ionicons name="information-circle-outline" size={20} color="hsl(239, 84%, 67%)" />
          <Text className="font-body-medium text-body-base text-primary">O nama</Text>
        </Pressable>
      </ScrollView>

      {!isInvestor && buyer ? (
        <EditBuyerModal
          visible={editOpen}
          buyer={buyer}
          userId={user?.id}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {isInvestor && investor ? (
        <EditInvestorModal
          visible={editOpen}
          investor={investor}
          userId={user?.id}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      <ChangePasswordModal
        visible={passwordOpen}
        userId={user?.id}
        isInvestor={isInvestor}
        onClose={() => setPasswordOpen(false)}
      />
    </SafeAreaView>
  );
}

function GuestProfile() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <LinearGradient
          colors={GRADIENT_INDIGO}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 96, width: 96, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person-outline" size={44} color="#ffffff" />
        </LinearGradient>

        <Text className="mt-8 text-center font-display text-h2 text-white">
          Još uvek nemate profil?
        </Text>
        <Text className="mt-3 text-center font-body text-body-base text-muted">
          Prijavite se ili napravite nalog kako biste ispratili najnovije oglase i kontaktirali
          investitore.
        </Text>

        <View className="mt-10 w-full gap-3">
          <GradientButton title="Uloguj se" onPress={() => router.push('/(auth)/login' as never)} />

          <Pressable
            onPress={() => router.push('/(auth)/register' as never)}
            className="h-14 items-center justify-center rounded-full border border-border bg-surface active:opacity-80">
            <Text className="font-body-medium text-body-base text-primary">Registruj se</Text>
          </Pressable>
        </View>
      </View>
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
