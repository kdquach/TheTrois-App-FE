import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Button, Surface, ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useOrderStore } from '../../store/orderStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useAuthStore } from '../../store/authStore';
import * as feedbackApi from '../../api/feedbackApi';
import ProductReviewRow from '../../components/ProductReviewRow';
import Toast from 'react-native-toast-message';
import * as orderApi from '../../api/orderApi';

export default function OrderReviewScreen() {
  const { orderId } = useLocalSearchParams();
  const { orders } = useOrderStore();
  const { createFeedback } = useFeedbackStore();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState({}); // key: productId -> { rating, content }
  const [alreadyReviewed, setAlreadyReviewed] = useState({}); // productId -> true

  // Load order (try store first)
  useEffect(() => {
    if (!orderId) return;
    const fromStore = orders.find(o => (o.orderId || o.id) === orderId);
    if (fromStore) {
      setOrder(fromStore);
      return;
    }
    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const data = await orderApi.getOrderById(orderId);
        setOrder(data);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Không tải được đơn hàng' });
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Guard: only allow reviewing completed orders
  useEffect(() => {
    if (!order) return;
    const status = order.status;
    if (status !== 'completed') {
      Toast.show({ type: 'info', text1: 'Chỉ đánh giá đơn đã hoàn thành' });
      try { router.back(); } catch(e) {}
    }
  }, [order]);

  // After order & user loaded, prefetch existing feedbacks to disable rows
  useEffect(() => {
    const run = async () => {
      if (!order || !user) return;
      const uid = user.id || user._id;
      const products = order.products || [];
      const result = {};
      await Promise.all(products.map(async (p) => {
        const pid = p.productId || p.id || p._id;
        if (!pid) return;
        try {
          const data = await feedbackApi.getFeedbacks({ productId: pid });
          const list = Array.isArray(data) ? data : (data.results || data.data || []);
          const has = list.some(f => {
            const fu = f.userId?.id || f.userId?._id || f.userId;
            return String(fu) === String(uid);
          });
          if (has) result[pid] = true;
        } catch (e) {}
      }));
      setAlreadyReviewed(result);
    };
    run();
  }, [order, user]);

  const handleRowChange = (productDraft) => {
    if (!productDraft.productId) return; // ignore if missing id
    setDrafts(prev => ({ ...prev, [productDraft.productId]: productDraft }));
  };

  const handleSubmitAll = async () => {
    if (!order) return;
    const products = order.products || [];
    const toSend = products
      .map(p => {
        const pid = p.productId || p.id || p._id;
        const d = drafts[pid];
        return { pid, draft: d };
      })
      .filter(item => item.pid && item.draft && item.draft.rating > 0);

    if (!toSend.length) {
      Toast.show({ type: 'error', text1: 'Chọn ít nhất một sản phẩm để đánh giá' });
      return;
    }

    setSubmitting(true);
    const successes = []; const failures = [];
    for (const { pid, draft } of toSend) {
      try {
        await createFeedback({ productId: pid, rating: draft.rating, content: (draft.content || 'Tốt').trim() });
        successes.push(pid);
      } catch (e) {
        failures.push(pid);
      }
    }
    setSubmitting(false);
    if (successes.length) {
      Toast.show({ type: 'success', text1: `Đã gửi ${successes.length} đánh giá` });
    }
    if (failures.length) {
      Toast.show({ type: 'error', text1: `Lỗi với ${failures.length} sản phẩm` });
    }
    if (successes.length) router.back();
  };

  if (!orderId) {
    return <View style={styles.center}><Text>Thiếu orderId</Text></View>;
  }
  if (loadingOrder) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (!order) {
    return <View style={styles.center}><Text>Không tìm thấy đơn hàng</Text></View>;
  }

  const products = order.products || [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.headerPlaceholder}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} style={styles.backButton} />
        <Text variant="headlineSmall" style={styles.title}>Đánh giá đơn hàng #{String(order.orderId || order.id).slice(-4)}</Text>
      </View>
      <Surface style={styles.note} elevation={0}>
        <Text variant="bodySmall" style={{ opacity: 0.7 }}>Chỉ những sản phẩm bạn chọn sao sẽ được gửi. Nội dung trống sẽ tự điền "Tốt".</Text>
      </Surface>
      {products.map(p => {
        const pid = p.productId || p.id || p._id;
        return (
          <ProductReviewRow
            key={pid}
            product={p}
            onChange={handleRowChange}
            disabled={alreadyReviewed[pid]}
          />
        );
      })}
      <Button
        mode="contained"
        onPress={handleSubmitAll}
        loading={submitting}
        style={styles.submitBtn}
        disabled={submitting}
      >
        Gửi đánh giá đã chọn
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 56 },
  headerPlaceholder: { position: 'relative', marginBottom: 8 },
  backButton: { position: 'absolute', top: -8, left: -8, borderRadius: 20 },
  title: { fontWeight: 'bold', marginBottom: 12, paddingLeft: 32 },
  note: { marginBottom: 12 },
  submitBtn: { marginTop: 8, borderRadius: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
