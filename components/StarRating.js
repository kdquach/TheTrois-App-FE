import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Text } from 'react-native-paper';

export default function StarRating({ value = 0, size = 24, onChange, editable = true }) {
  const theme = useTheme();
  const stars = [1,2,3,4,5];
  return (
    <View style={styles.row}>
      {stars.map((s) => {
        const filled = s <= value;
        return (
          <TouchableOpacity
            key={s}
            disabled={!editable}
            onPress={() => onChange && onChange(s)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? theme.colors.starbucksGold : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
