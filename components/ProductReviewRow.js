import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, TextInput, Chip } from 'react-native-paper';
import StarRating from './StarRating';

const PRESETS = [
  'Ngon',
  'Vừa miệng',
  'Sẽ mua lại',
  'Đóng gói sạch',
  'Hơi ngọt',
];

export default function ProductReviewRow({ product, onChange, disabled = false }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');

  const productId = product?.productId || product?.id || product?._id;

  const emit = (next) => {
    onChange && onChange({ productId, rating, content, ...next });
  };

  const handleSelectPreset = (p) => {
    setContent(p);
    emit({ content: p });
  };

  return (
    <Surface style={styles.card} elevation={1}>
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
        style={{ marginTop: 8 }}
      />
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Chip key={p} style={styles.chip} onPress={() => !disabled && handleSelectPreset(p)}>{p}</Chip>
        ))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 12, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontWeight: '600', flex: 1, marginRight: 8 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { marginRight: 6, marginTop: 6 },
});
