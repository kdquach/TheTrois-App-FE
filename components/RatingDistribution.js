import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

// Connected bar distribution: a single bar per row with percentage fill.
// `segments` (default 4) is kept for optional separators only.
export default function RatingDistribution({
  distribution = {},
  count = 0,
  segments = 4,
  activeColor,
  inactiveColor = '#E0E0E0',
  showRightCount = false,
  barColor, // backward-compat: if provided, use as activeColor
}) {
  const total = count || Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const rows = [5, 4, 3, 2, 1];
  const filledColor = activeColor || barColor || '#2E7D32';

  return (
    <View style={{ gap: 8 }}>
      {rows.map((star) => {
        const c = distribution[star] || 0;
        const ratio = total ? Math.max(0, Math.min(1, c / total)) : 0;
        const widthPercent = `${(ratio * 100).toFixed(2)}%`;
        return (
          <View key={star} style={styles.row}>
            <Text style={styles.starLabel}>{star}</Text>
            <View style={[styles.barContainer, { backgroundColor: inactiveColor }]}> 
              {/* Filled portion */}
              <View style={[styles.barFill, { width: widthPercent, backgroundColor: filledColor }]} />
              {/* Optional segment separators (visual only) */}
              {segments > 1 && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  {Array.from({ length: segments - 1 }).map((_, i) => (
                    <View
                      key={`sep-${i}`}
                      style={[
                        styles.separator,
                        { left: `${(((i + 1) / segments) * 100).toFixed(2)}%` },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
            {showRightCount && <Text style={styles.count}>{c}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    width: 20,
    textAlign: 'right',
    fontWeight: '600',
    color: '#444',
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  separator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  count: {
    width: 32,
    textAlign: 'right',
    color: '#555',
    fontSize: 13,
  },
});
