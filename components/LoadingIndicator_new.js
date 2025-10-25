import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

import {
  CircleSnail,
  Bars,
  Pulse,
  DoubleBounce,
  Wave,
  ChasingDots,
  ThreeBounce,
  Circle,
  Swing,
  Flow,
  Bounce,
} from 'react-native-loader-kit';

/**
 * Custom Loading Component với react-native-loader-kit
 *
 * Các kiểu loading đẹp từ react-native-loader-kit:
 *
 * 1. 'pulse' - Vòng tròn phóng to thu nhỏ (PHÙ HỢP - giống bong bóng trà) 🧋
 * 2. 'bounce' - Ba chấm nảy (PHÙ HỢP - giống trân châu) 💧
 * 3. 'wave' - Sóng chuyển động (PHÙ HỢP - như chất lỏng) 🌊
 * 4. 'flow' - Chuyển động mượt (PHÙ HỢP - như rót trà) ☕
 * 5. 'bars' - Các thanh nhảy (PHÙ HỢP - như level trà sữa) 📊
 * 6. 'circle' - Vòng tròn xoay
 * 7. 'snail' - Vòng tròn mượt
 * 8. 'dots' - Hai chấm đuổi nhau
 * 9. 'swing' - Swing animation
 * 10. 'double' - Double bounce
 */

export default function LoadingIndicator({
  type = 'pulse', // Default: pulse (giống bong bóng)
  size = 48,
  color,
  text,
}) {
  const theme = useTheme();
  const defaultColor =
    color || theme.colors.starbucksGreen || theme.colors.primary;

  // Convert size string to number
  const loaderSize =
    typeof size === 'string'
      ? size === 'small'
        ? 32
        : size === 'large'
        ? 48
        : 40
      : size;

  const renderLoading = () => {
    switch (type) {
      case 'pulse':
        return <Pulse size={loaderSize} color={defaultColor} />;
      case 'bounce':
        return <ThreeBounce size={loaderSize} color={defaultColor} />;
      case 'wave':
        return <Wave size={loaderSize} color={defaultColor} />;
      case 'flow':
        return <Flow size={loaderSize} color={defaultColor} />;
      case 'bars':
        return <Bars size={loaderSize} color={defaultColor} />;
      case 'circle':
        return <Circle size={loaderSize} color={defaultColor} />;
      case 'snail':
        return <CircleSnail size={loaderSize} color={defaultColor} />;
      case 'dots':
        return <ChasingDots size={loaderSize} color={defaultColor} />;
      case 'swing':
        return <Swing size={loaderSize} color={defaultColor} />;
      case 'double':
        return <DoubleBounce size={loaderSize} color={defaultColor} />;
      default:
        return <Pulse size={loaderSize} color={defaultColor} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderLoading()}
      {text && (
        <Text
          variant="bodyMedium"
          style={[styles.text, { color: defaultColor }]}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
  },
});
