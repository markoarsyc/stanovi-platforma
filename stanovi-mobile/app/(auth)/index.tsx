import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import { GradientText } from '@/components/ui/GradientText';

export default function LandingScreen() {
  const router = useRouter();

  const handleListings = () => {
    router.push('/(tabs)/oglasi' as never);
  };

  const handleForgotPassword = () => {
    Alert.alert('Zaboravljena lozinka', 'Funkcionalnost uskoro');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      {/* Hero — full-bleed image that fades into the background, with the title overlaid */}
      <View className="relative h-[56%] w-full">
        <Image
          source={require('@/assets/images/hero.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {/* Fade the bottom of the image into the dark background */}
        <LinearGradient
          colors={['transparent', 'rgba(11,11,18,0.55)', '#0B0B12']}
          locations={[0, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Title */}
        <View className="absolute inset-x-0 bottom-6 px-6">
          <Text className="font-display text-h1 text-white">Vaš novi dom u</Text>
          <GradientText className="font-display text-h1">srcu Beograda</GradientText>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center px-6">
        {/* Sub-copy */}
        <Text className="mt-6 text-center font-body text-body-base text-muted">
          Otkrijte ekskluzivne stanove u izgradnji na najprestižnijim lokacijama. Investirajte u
          budućnost sa Indigo Beograd.
        </Text>

        {/* Actions */}
        <View className="mt-8 w-full items-center gap-4">
          <GradientButton title="Uloguj se" onPress={() => router.push('/(auth)/login' as never)} />

          <Pressable onPress={handleForgotPassword} className="py-1">
            <Text className="text-center font-body text-body-sm text-muted">Zaboravljena lozinka?</Text>
          </Pressable>

          <GradientButton title="Registruj se" onPress={() => router.push('/(auth)/register' as never)} />
        </View>

        {/* Bottom link */}
        <Pressable onPress={handleListings} className="mt-auto items-center py-2">
          <Text className="text-center font-body-medium text-body-base text-primary">
            Pogledaj oglase →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
