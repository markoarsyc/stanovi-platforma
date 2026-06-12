import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, type TextProps } from 'react-native';

import { GRADIENT_INDIGO } from '@/constants/gradients';

interface GradientTextProps extends TextProps {
  children: React.ReactNode;
  // Gradient stops; defaults to the indigo brand gradient.
  colors?: readonly [string, string, ...string[]];
}

// Renders text filled with a linear gradient by using the text as an alpha mask
// over a LinearGradient. The masked Text is duplicated (transparent) to size the
// gradient to the glyphs.
export function GradientText({ children, colors = GRADIENT_INDIGO, className, ...props }: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text className={className} {...props}>{children}</Text>}>
      <LinearGradient colors={[...colors] as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text className={className} {...props} style={[props.style, { opacity: 0 }]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
