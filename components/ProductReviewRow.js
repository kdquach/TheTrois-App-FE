import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, TextInput, Chip, useTheme } from 'react-native-paper';
import StarRating from './StarRating';

const PRESETS = [
  'Ngon',
  'Vừa miệng',
  'Sẽ mua lại',
  'Đóng gói sạch',
  'Hơi ngọt',
];

export default function ProductReviewRow({ product, onChange, disabled = false }) {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);

  const productId = product?.productId || product?.id || product?._id;

  const emit = (next) => {
    onChange && onChange({ productId, rating, content, ...next });
  };

  const handleSelectPreset = (p) => {
    if (selectedPreset === p) {
      // toggle off
      setSelectedPreset(null);
      setContent('');
      emit({ content: '' });
      return;
    }
    setSelectedPreset(p);
    setContent(p);
    emit({ content: p });
  };

  return (
    <Surface style={styles.card} elevation={0}>
      <View style={styles.header}>
        <Text style={styles.name} variant="titleSmall">{product?.name || 'Sản phẩm'}</Text>
        <StarRating value={rating} onChange={(v) => { setRating(v); emit({ rating: v }); }} size={24} editable={!disabled} />
      </View>
      <TextInput
        mode="outlined"
        placeholder="Cảm nhận của bạn..."
        multiline
        value={content}
        onChangeText={(t) => { setContent(t); emit({ content: t }); }}
        editable={!disabled}
        style={{ marginTop: 8, paddingVertical: 8 }}
      />
      <View style={styles.presets}>
        {PRESETS.map((p) => {
          const active = selectedPreset === p;
          return (
            <Chip
              key={p}
              onPress={() => !disabled && handleSelectPreset(p)}
              style={[
                styles.chip,
                { backgroundColor: '#EEEEEE', borderWidth: 1, borderColor: 'transparent' },
                active && { backgroundColor: '#E8F5E9', borderColor: theme.colors.primary },
              ]}
              textStyle={[{ color: '#333' }, active && { color: theme.colors.primary, fontWeight: '600' }]}
            >
              {p}
            </Chip>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontWeight: '600', flex: 1, marginRight: 8 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { marginRight: 6, marginTop: 6 },
});
