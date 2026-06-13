import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { GradientText } from '@/components/ui/GradientText';
import { GRADIENT_INDIGO } from '@/constants/gradients';
import { getToken } from '@/lib/storage/token';
import { hasCompletedOnboarding } from '@/lib/storage/onboarding';

// Minimum time the splash stays on screen so the brand animation can play out,
// even if the storage reads resolve instantly.
const MIN_SPLASH_MS = 1900;

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(16);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.4)) });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 700 }));
    textTranslate.value = withDelay(400, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [logoOpacity, logoScale, textOpacity, textTranslate]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [onboarded, token] = await Promise.all([
        hasCompletedOnboarding(),
        getToken(),
        new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS)),
      ]);
      if (!active) return;

      if (!onboarded) {
        router.replace('/(onboarding)' as never);
      } else if (token) {
        router.replace('/(tabs)/oglasi' as never);
      } else {
        router.replace('/(auth)' as never);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-background">
      {/* Ambient gradient glow behind the mark */}
      <LinearGradient
        colors={['rgba(99,102,241,0.22)', 'transparent']}
        style={styles.glow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={logoStyle} className="items-center">
        <LinearGradient
          colors={[...GRADIENT_INDIGO]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orb}>
          <Ionicons name="business" size={48} color="#ffffff" />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={textStyle} className="mt-8 items-center">
        <View className="flex-row">
          <GradientText className="font-display text-h1">Indigo</GradientText>
          <Text className="font-display text-h1 text-white"> Beograd</Text>
        </View>
        <Text className="mt-3 font-body text-body-base text-muted">Vaš novi dom u srcu grada</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: '18%',
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
