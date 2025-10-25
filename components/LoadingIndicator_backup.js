import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Custom Loading Component - Bubble Tea Shop Theme
 *
 * Bạn có thể thay đổi kiểu loading tại đây:
 *
 * Các kiểu loading có sẵn:
 * 1. 'spinner' - Vòng tròn xoay mặc định (ActivityIndicator)
 * 2. 'dots' - 3 chấm tròn nhảy (giống bong bóng trà sữa)
 * 3. 'bubble' - Icon cốc trà sữa phóng to thu nhỏ
 * 4. 'starbucks' - Icon cà phê Starbucks xoay
 * 5. 'tea' - Icon trà xoay
 */

export default function LoadingIndicator({
  type = 'bubble', // Thay đổi type ở đây: 'spinner', 'dots', 'bubble', 'starbucks', 'tea'
  size = 'large',
  color,
  text,
}) {
  const theme = useTheme();
  const defaultColor =
    color || theme.colors.starbucksGreen || theme.colors.primary;

  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return <LoadingDots color={defaultColor} />;
      case 'bubble':
        return <LoadingPulse color={defaultColor} icon="cup" />;
      case 'starbucks':
        return <LoadingPulse color={defaultColor} icon="coffee" />;
      case 'tea':
        return <LoadingPulse color={defaultColor} icon="tea" />;
      default:
        return <ActivityIndicator size={size} color={defaultColor} />;
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

// Loading với 3 chấm nhảy
function LoadingDots({ color }) {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, transform: [{ translateY: dot1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, transform: [{ translateY: dot2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, transform: [{ translateY: dot3 }] },
        ]}
      />
    </View>
  );
}

// Loading với icon phóng to thu nhỏ
function LoadingPulse({ color, icon }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const rotate = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale }, { rotate: spin }],
      }}
    >
      <MaterialCommunityIcons name={icon} size={48} color={color} />
    </Animated.View>
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
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
