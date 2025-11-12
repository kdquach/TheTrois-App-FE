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
      try { router.back(); } catch (e) { }
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
        } catch (e) { }
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Flat header row */}
      <View style={styles.headerRow}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} style={styles.headerBack} />
        <Text variant="titleLarge" style={styles.headerText}>Đánh giá đơn hàng #{String(order.orderId || order.id).slice(-4)}</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 6,
    gap: 4,
  },
  headerBack: { margin: 0 },
  headerText: { fontSize: 20, fontWeight: '700', flexShrink: 1 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { opacity: 0.7 },
  submitBtn: { borderRadius: 28, marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
