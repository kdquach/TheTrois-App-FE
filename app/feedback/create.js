import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Chip, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import StarRating from '../../components/StarRating';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useAuthStore } from '../../store/authStore';
import Toast from 'react-native-toast-message';

const PRESET_CONTENT = [
  'Ngon tuyệt! Sẽ mua lại',
  'Vị ổn nhưng cần cải thiện',
  'Không ngon như mong đợi',
  'Đóng gói cẩn thận, giao nhanh',
  'Hơi ngọt, mong giảm đường',
];

export default function CreateFeedbackScreen() {
  const theme = useTheme();
  const { productId, orderId } = useLocalSearchParams();
  const { createFeedback, fetchFeedbacks } = useFeedbackStore();
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null); // currently chosen quick phrase

  // Prevent duplicate review (inform user, do not block)
  useEffect(() => {
    if (!productId) return;
    if (!(user?.id || user?._id)) return;
    let cancelled = false;
    fetchFeedbacks({ productId })
      .then(list => {
        if (cancelled) return;
        const uid = user.id || user._id;
        const exists = list.some(f => {
          const fu = f.userId?.id || f.userId?._id || f.userId || f.user?.id || f.user?._id;
          return String(fu) === String(uid);
        });
        if (exists) {
          Toast.show({ type: 'info', text1: 'Bạn đã đánh giá sản phẩm này' });
        }
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [productId, user?.id, user?._id]);

  // If user edits content manually after selecting a preset, clear selection
  useEffect(() => {
    if (selectedPreset && content !== selectedPreset) {
      setSelectedPreset(null);
    }
  }, [content, selectedPreset]);

  const handleSelectPreset = (text) => {
    if (selectedPreset === text) {
      // toggle off
      setSelectedPreset(null);
      setContent('');
    } else {
      setSelectedPreset(text);
      setContent(text);
    }
  };

  const handleSubmit = async () => {
    if (!productId) {
      Toast.show({ type: 'error', text1: 'Thiếu productId' });
      return;
    }
    if (!rating) {
      Toast.show({ type: 'error', text1: 'Vui lòng chọn số sao' });
      return;
    }
    setSubmitting(true);
    try {
      await createFeedback({ productId, rating, content: content.trim() });
      Toast.show({ type: 'success', text1: 'Đã gửi đánh giá' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Gửi đánh giá thất bại' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header row: back + title */}
      <View style={styles.headerRow}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} style={styles.headerBack} />
        <Text variant="titleLarge" style={styles.headerText}>Đánh giá</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Rating Card (no shadow) */}
        <View style={styles.ratingCard}>
          {/* Row 1: Title with order code if available */}
          <Text variant="titleMedium" style={styles.cardTitle}>
            {orderId ? `Đánh giá đơn hàng (#${String(orderId).slice(-4)})` : 'Đánh giá sản phẩm'}
          </Text>
          {/* Row 2: Star rating */}
          <View style={styles.starsRow}>
            <StarRating value={rating} onChange={setRating} size={40} />
          </View>
          {/* Row 3: Quick preset phrases */}
            <View style={styles.presetsRow}>
              {PRESET_CONTENT.map(p => {
                const active = selectedPreset === p;
                return (
                  <Chip
                    key={p}
                    onPress={() => handleSelectPreset(p)}
                    style={[
                      styles.presetChip,
                      active && {
                        backgroundColor: '#E8F5E9',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    textStyle={[
                      styles.presetChipText,
                      active && { color: theme.colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {p}
                  </Chip>
                );
              })}
            </View>
          {/* Row 4: Text input */}
          <TextInput
            mode="outlined"
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="Chia sẻ cảm nhận của bạn..."
            style={styles.textInput}
          />
        </View>
        {/* Submit button (bottom) */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting || !rating}
          loading={submitting}
          style={styles.submitBtn}
        >
          Gửi đánh giá
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 4,
  },
  headerBack: { margin: 0 },
  headerText: { fontWeight: '700' },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  starsRow: { alignItems: 'flex-start', marginBottom: 12 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  presetChip: {
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 0,
  },
  presetChipText: { color: '#333' },
  textInput: { marginTop: 4 },
  submitBtn: { borderRadius: 28 },
});
