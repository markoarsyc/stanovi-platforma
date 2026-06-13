import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import { GradientText } from '@/components/ui/GradientText';
import { GRADIENT_INDIGO } from '@/constants/gradients';
import { useAuth } from '@/lib/auth/AuthContext';
import { setOnboardingComplete } from '@/lib/storage/onboarding';

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  highlight: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'business',
    title: 'Ekskluzivni stanovi',
    highlight: 'u izgradnji',
    description:
      'Otkrijte najnovije projekte na najprestižnijim lokacijama u Beogradu — svi na jednom mestu.',
  },
  {
    icon: 'trending-up',
    title: 'Investirajte',
    highlight: 'u budućnost',
    description:
      'Pratite napredak gradnje i obezbedite svoj dom po povoljnijim cenama, još pre useljenja.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Direktno do',
    highlight: 'investitora',
    description:
      'Bez posrednika i skrivenih troškova. Kontaktirajte verifikovane investitore u svega par dodira.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<React.ComponentRef<typeof Animated.ScrollView>>(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    await setOnboardingComplete();
    // Logged-in users land straight on the listings; everyone else goes to login.
    router.replace((isAuthenticated ? '/(tabs)/oglasi' : '/(auth)/login') as never);
  };

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Skip */}
      <View className="h-12 flex-row items-center justify-end px-6">
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12} className="py-1">
            <Text className="font-body-medium text-body-sm text-muted">Preskoči</Text>
          </Pressable>
        )}
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        className="flex-1">
        {SLIDES.map((slide, i) => (
          <OnboardingSlide key={i} slide={slide} index={i} scrollX={scrollX} width={width} />
        ))}
      </Animated.ScrollView>

      {/* Dots */}
      <View className="mb-8 mt-2 flex-row items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <Dot key={i} index={i} scrollX={scrollX} width={width} />
        ))}
      </View>

      {/* Action */}
      <View className="px-6 pb-2">
        <GradientButton title={isLast ? 'Započni' : 'Dalje'} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}

function OnboardingSlide({
  slide,
  index,
  scrollX,
  width,
}: {
  slide: Slide;
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View style={animatedStyle} className="items-center">
        {/* Icon orb with ambient glow */}
        <View className="items-center justify-center">
          <LinearGradient
            colors={['rgba(99,102,241,0.18)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130 }}
          />
          <LinearGradient
            colors={[...GRADIENT_INDIGO]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 140,
              height: 140,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name={slide.icon} size={64} color="#ffffff" />
          </LinearGradient>
        </View>

        {/* Copy */}
        <View className="mt-12 items-center">
          <Text className="text-center font-display text-h1 text-white">{slide.title}</Text>
          <GradientText className="font-display text-h1">{slide.highlight}</GradientText>
          <Text className="mt-5 text-center font-body text-body-base leading-6 text-muted">
            {slide.description}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const style = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP),
  }));

  return <Animated.View style={style} className="h-2 rounded-full bg-primary" />;
}
