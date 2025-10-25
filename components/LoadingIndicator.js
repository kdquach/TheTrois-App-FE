import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import {
  PulseIndicator,
  WaveIndicator,
  BarIndicator,
  DotIndicator,
} from 'react-native-indicators';

export default function LoadingIndicator({
  type = 'pulse',
  size = 48,
  color = '#00A86B',
  text,
}) {
  const renderIndicator = () => {
    switch (type) {
      case 'wave':
        return <WaveIndicator color={color} size={size} />;
      case 'bar':
        return <BarIndicator color={color} size={size} />;
      case 'dots':
        return <DotIndicator color={color} size={size} />;
      default:
        return <PulseIndicator color={color} size={size} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderIndicator()}
      {text && <Text style={[styles.text, { color }]}>{text}</Text>}
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
