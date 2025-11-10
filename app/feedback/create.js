import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, TextInput, Chip, IconButton } from 'react-native-paper';
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

  // Require coming from an order and prevent duplicate review
  React.useEffect(() => {
    if (!productId) return;
    // If not from order, we still allow but will check duplicate by user
    if (user?.id || user?._id) {
      fetchFeedbacks({ productId })
        .then((list) => {
          const uid = user.id || user._id;
          const exists = list.some((f) => {
            const fu = f.userId?.id || f.userId?._id || f.userId;
            return String(fu) === String(uid);
          });
          if (exists) {
            Toast.show({ type: 'info', text1: 'Bạn đã đánh giá sản phẩm này' });
            router.back();
          }
        })
        .catch(() => {});
    }
  }, [productId, user?.id, user?._id]);

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
      // error toast handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.headerPlaceholder}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} style={styles.backButton} />
        <Text variant="headlineSmall" style={styles.title}>Đánh giá sản phẩm</Text>
      </View>
      <Surface style={styles.card} elevation={0}>
        <Text variant="titleMedium" style={styles.label}>Chọn số sao</Text>
        <StarRating value={rating} onChange={setRating} size={36} />
        <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 8 }}>Sản phẩm: {productId}</Text>
      </Surface>

  <Surface style={styles.card} elevation={0}>
        <Text variant="titleMedium" style={styles.label}>Nội dung</Text>
        <TextInput
          mode="outlined"
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Chia sẻ cảm nhận của bạn..."
          style={{ marginTop: 8 }}
        />
        <View style={styles.presets}>
          {PRESET_CONTENT.map((p) => (
            <Chip
              key={p}
              onPress={() => setContent(p)}
              style={{ marginRight: 8, marginTop: 8 }}
            >
              {p}
            </Chip>
          ))}
        </View>
      </Surface>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={submitting || !rating}
        style={styles.submitBtn}
      >
        Gửi đánh giá
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 56 },
  headerPlaceholder: { position: 'relative', marginBottom: 8 },
  backButton: { position: 'absolute', top: -8, left: -8, borderRadius: 20 },
  title: { fontWeight: 'bold', marginBottom: 16, paddingLeft: 32 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginBottom: 8 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  submitBtn: { marginTop: 8, borderRadius: 24 },
});
