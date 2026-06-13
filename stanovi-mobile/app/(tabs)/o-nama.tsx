import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import { GradientText } from '@/components/ui/GradientText';
import { GRADIENT_INDIGO } from '@/constants/gradients';

type Feature = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: 'business',
    title: 'Ekskluzivni stanovi u izgradnji',
    description: 'Najnoviji projekti na najprestižnijim lokacijama u Beogradu — svi na jednom mestu.',
  },
  {
    icon: 'trending-up',
    title: 'Investirajte u budućnost',
    description: 'Pratite napredak gradnje i obezbedite dom po povoljnijim cenama, još pre useljenja.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Direktno do investitora',
    description: 'Bez posrednika i skrivenih troškova. Kontaktirajte verifikovane investitore u par dodira.',
  },
];

export default function AboutScreen() {
  const router = useRouter();

  const handleReplay = () => {
    router.push('/(onboarding)' as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pb-10 pt-2">

        {/* Header */}
        <View className="mb-10 items-center">
          <LinearGradient
            colors={[...GRADIENT_INDIGO]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Ionicons name="information-circle" size={44} color="#ffffff" />
          </LinearGradient>

          <View className="items-center">
            <GradientText className="font-display text-h1">Indigo</GradientText>
            <Text className="font-display text-h2 text-white">Beograd</Text>
          </View>
          <Text className="mt-3 text-center font-body text-body-base text-muted">
            Vaš pouzdani partner za pronalazak stana u novogradnji
          </Text>
        </View>

        {/* Feature cards */}
        <View className="gap-4">
          {FEATURES.map((feature) => (
            <View
              key={feature.icon}
              className="flex-row gap-4 rounded-2xl border border-border bg-surface p-4">
              <LinearGradient
                colors={[...GRADIENT_INDIGO]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ionicons name={feature.icon} size={24} color="#ffffff" />
              </LinearGradient>

              <View className="flex-1">
                <Text className="font-body-medium text-h5 text-foreground">{feature.title}</Text>
                <Text className="mt-1 font-body text-body-sm text-muted">{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Replay onboarding */}
        <View className="mt-10">
          <Text className="mb-4 text-center font-body text-body-sm text-muted">
            Pogledajte uvodni vodič ponovo
          </Text>
          <GradientButton title="Ponovi uvod" onPress={handleReplay} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
