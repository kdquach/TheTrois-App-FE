import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Appbar, Text, Surface, Divider, Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import * as feedbackApi from '../../api/feedbackApi';

// Simplified status config (no gradients, flatter color approach)
const ORDER_STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', icon: 'clock-outline', color: '#FF9800' },
  confirmed: { label: 'Đã xác nhận', icon: 'check-circle', color: '#2196F3' },
  preparing: { label: 'Đang pha chế', icon: 'coffee-maker', color: '#00ac45' },
  ready: { label: 'Sẵn sàng lấy', icon: 'bell-ring', color: '#D4AF37' },
  completed: { label: 'Hoàn thành', icon: 'check-all', color: '#4CAF50' },
  cancelled: { label: 'Đã hủy', icon: 'close-circle', color: '#F44336' },
};

export default function OrdersScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pending'); // 'pending' | 'tracking' | 'history'
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [reviewLocked, setReviewLocked] = useState({}); // orderId -> true when all products already reviewed

  const { orders, loading, fetchOrders, updateOrderStatus, orderLogs, fetchOrderLogs } = useOrderStore();
  const { getItemTotalPrice } = useCartStore();

  // Map tab to statuses
  const tabStatuses = {
    pending: ['pending'],
    tracking: ['confirmed', 'preparing', 'ready'],
    history: ['completed', 'cancelled'],
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(tabStatuses[selectedTab]);
    }, [selectedTab])
  );

  // Lightweight auto-refresh: while on Pending/Tracking tabs, refetch periodically for faster status updates
  useFocusEffect(
    useCallback(() => {
      let interval;
      let logsInterval;
      if (selectedTab === 'pending' || selectedTab === 'tracking') {
        interval = setInterval(() => {
          fetchOrders(tabStatuses[selectedTab]);
        }, 10000); // 10s refresh
        // refresh logs for expanded orders too
        logsInterval = setInterval(() => {
          expandedOrders.forEach((oid) => fetchOrderLogs(oid));
        }, 15000);
      }
      return () => {
        if (interval) clearInterval(interval);
        if (logsInterval) clearInterval(logsInterval);
      };
    }, [selectedTab, expandedOrders])
  );

  // Prefetch feedbacks to determine if all products in a completed order were reviewed by current user
  useEffect(() => {
    const run = async () => {
      if (!user || !Array.isArray(orders) || !orders.length) return;
      const uid = user.id || user._id;
      const result = {};
      // Only need to check completed orders
      const completedOrders = orders.filter(o => o.status === 'completed');
      for (const o of completedOrders) {
        const products = o.products || [];
        let allReviewed = true;
        for (const p of products) {
          const pid = p._id || p.productId || p.id;
          if (!pid) continue;
          try {
            const data = await feedbackApi.getFeedbacks({ productId: pid, limit: 100 });
            const list = Array.isArray(data) ? data : (data.results || data.data || []);
            const has = list.some(f => {
              const fu = f.userId?.id || f.userId?._id || f.userId;
              const byMe = String(fu) === String(uid);
              const verified = !!f.isVerifiedPurchase;
              return byMe && verified;
            });
            if (!has) { allReviewed = false; break; }
          } catch (e) { allReviewed = false; break; }
        }
        result[o.orderId] = allReviewed;
      }
      setReviewLocked(prev => ({ ...prev, ...result }));
    };
    run();
  }, [orders, user]);

  const toggleOrderExpanded = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      // Prefetch logs for accurate timeline timestamps
      fetchOrderLogs(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const filteredOrders = orders.filter((order) => tabStatuses[selectedTab].includes(order.status));

  const formatOrderDate = (date) => {
    try {
      const d = new Date(date);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const dd = d.getDate();
      const m = d.getMonth() + 1;
      const yyyy = d.getFullYear();
      return `${hh}:${mm}, ${dd} thg ${m} ${yyyy}`;
    } catch {
      return String(date);
    }
  };

  const renderInlineTimeline = (order) => {
    // Build statuses based on current state
    const isCancelled = order.status === 'cancelled';
    // If cancelled: show only 'pending' -> 'cancelled'
    const statuses = isCancelled
      ? ['pending', 'cancelled']
      : ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

    const seq = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const currentIdx = seq.indexOf(order.status);
    const PROGRESS_COLOR = theme.colors.primary; // unify green color for all progress steps
    const CANCEL_COLOR = ORDER_STATUS_CONFIG.cancelled.color; // red

    return (
      <View>
        {statuses.map((s, idx) => {
          const config = ORDER_STATUS_CONFIG[s];

          // Determine visual state
          let done = false;
          if (isCancelled) {
            done = s === 'pending'; // only the first step marked as done
          } else {
            const sIdx = seq.indexOf(s);
            done = sIdx !== -1 && sIdx <= currentIdx;
          }

          // Colors: green for done, grey for upcoming; cancelled dot/connector red
          const isLast = idx === statuses.length - 1;
          const isCancelledStep = s === 'cancelled';
          const dotColor = isCancelledStep ? CANCEL_COLOR : (done ? PROGRESS_COLOR : '#E0E0E0');
          const stickColor = isLast
            ? 'transparent'
            : (isCancelled && !isCancelledStep ? CANCEL_COLOR : (done ? PROGRESS_COLOR : '#E0E0E0'));
          const iconColor = isCancelledStep ? CANCEL_COLOR : (done ? PROGRESS_COLOR : '#BDBDBD');

          // Timestamp per step: pending uses order.createdAt, others from logs newStatus
          const logs = orderLogs?.[order.orderId] || [];
          let ts = order.createdAt;
          if (s !== 'pending') {
            const log = logs.find((l) => l.newStatus === s);
            if (log) ts = log.changedAt || log.createdAt;
          }

          return (
            <View key={s} style={styles.timelineRowModal}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                {!isLast && (
                  <View style={[styles.stick, { backgroundColor: stickColor }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text variant="titleSmall" style={{ fontWeight: '600' }}>{config.label}</Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>{formatOrderDate(ts)}</Text>
              </View>
              <MaterialCommunityIcons name={config.icon} size={18} color={iconColor} />
            </View>
          );
        })}
      </View>
    );
  };

  const getStatusColor = (status) => (status === 'cancelled' ? theme.colors.error : theme.colors.primary);

  const renderOrderItem = (order) => {
    const handleCancelOrder = () => {
      Alert.alert('Hủy đơn hàng', 'Bạn có chắc chắn muốn hủy đơn hàng này?', [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateOrderStatus(order.orderId, 'cancelled');
              Toast.show({
                type: 'success',
                text1: 'Hủy đơn hàng thành công',
              });
              await fetchOrders(tabStatuses[selectedTab]);
            } catch (e) {
              // No-op; backend route may be missing. UI will refresh on next fetch.
            }
          },
        },
      ]);
    };

    const statusConfig =
      ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['pending']; // fallback
    const isExpanded = expandedOrders.has(order.orderId);

    return (
      <Surface key={order.orderId} style={styles.orderCard} elevation={0}>
        <View style={[styles.orderStatusBar, { backgroundColor: getStatusColor(order.status) }]} />

        <TouchableOpacity activeOpacity={0.7} onPress={() => toggleOrderExpanded(order.orderId)}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Surface
                style={[styles.orderIconContainer, { backgroundColor: `${getStatusColor(order.status)}15` }]}
                elevation={0}
              >
                <MaterialCommunityIcons
                  name="coffee"
                  size={24}
                  color={getStatusColor(order.status)}
                />
              </Surface>
              <View style={styles.orderHeaderInfo}>
                <Text variant="titleMedium" style={styles.orderId}>
                  Đơn hàng #ORD{order.orderId.slice(-3)}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.orderDate,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatOrderDate(order.createdAt)}
                </Text>
                {/* Status badge moved under order code (no shadow) */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <MaterialCommunityIcons
                    name={statusConfig.icon}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text variant="labelSmall" style={styles.statusText}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.orderHeaderRight}>
              <TouchableOpacity onPress={() => toggleOrderExpanded(order.orderId)}>
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="package-variant"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.summaryText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {order.products.length} món
            </Text>
          </View>
          <Text
            variant="titleLarge"
            style={styles.totalAmount}
          >
            {formatCurrency(order.totalAmount)}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.orderDetails}>
            <Divider style={styles.divider} />

            {/* Timeline */}
            <View style={styles.timelineSection}>
              <Text variant="labelLarge" style={styles.sectionTitle}>
                Trạng thái đơn hàng
              </Text>
              {renderInlineTimeline(order)}
            </View>

            <Divider style={styles.divider} />

            {/* Items */}
            <View style={styles.itemsSection}>
              <Text variant="labelLarge" style={styles.sectionTitle}>
                Chi tiết đơn hàng
              </Text>
              {order.products.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Surface
                    style={[
                      styles.itemQuantityBadge,
                      { backgroundColor: `${theme.colors.primary}15`, borderColor: theme.colors.primary, borderWidth: 1 },
                    ]}
                    elevation={0}
                  >
                    <Text variant="labelSmall" style={[styles.quantityText, { color: theme.colors.primary }]}>
                      {item.quantity}
                    </Text>
                  </Surface>
                  <View style={styles.itemInfo}>
                    <Text variant="titleSmall" style={styles.itemName}>
                      {item.name}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.itemPrice,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </Text>
                    {Array.isArray(item.toppings) &&
                      item.toppings.length > 0 && (
                        <View style={styles.toppingsList}>
                          {item.toppings.map((t, idx) => (
                            <Text
                              key={idx}
                              variant="labelSmall"
                              style={[
                                styles.toppingLine,
                                {
                                  color: theme.colors.onSurfaceVariant,
                                  opacity: 0.6,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {t.name} +{formatCurrency(t.price || 0)}
                            </Text>
                          ))}
                        </View>
                      )}

                    {/* Customization single line below toppings */}
                    {item.customization && (
                      <Text
                        variant="labelSmall"
                        style={[
                          styles.customizationText,
                          {
                            color: theme.colors.onSurfaceVariant,
                            opacity: 0.6,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {typeof item.customization === 'string'
                          ? item.customization
                          : item.customization?.description}
                      </Text>
                    )}
                  </View>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.itemTotal,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {formatCurrency(getItemTotalPrice(item))}
                  </Text>
                </View>
              ))}
            </View>

            <Divider style={styles.divider} />

            {/* Ordering User: not required per new spec - removed */}

            {/* Shipping Address */}
            {order.shippingAddress ? (
              <View style={styles.shippingSection}>
                <View style={styles.shippingRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.error} />
                  <Text
                    variant="bodySmall"
                    style={[styles.shippingAddressText, { color: theme.colors.onSurface }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {order.shippingAddress}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Payment Info */}
            <View style={styles.paymentSection}>
              <View style={[styles.paymentRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="credit-card-outline" size={20} color={theme.colors.onSurfaceVariant} />
                  <Text variant="labelSmall" style={styles.paymentLabel}>Phương thức thanh toán</Text>
                </View>
                <Text variant="labelLarge" style={{ fontWeight: '600' }}>
                  {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Online'}
                </Text>
              </View>
              {/* Removed duplicate cancel button here; single cancel button remains in Action Buttons section below */}
            </View>

            {/* Action Buttons */}
            {order.status === 'pending' ? (
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={handleCancelOrder}
                  style={[styles.actionButton, { flex: 1, backgroundColor: '#FFEBEE' }]}
                  textColor={theme.colors.error}
                  icon="close-circle-outline"
                >
                  Hủy đơn hàng
                </Button>
              </View>
            ) : order.status === 'completed' ? (
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    // Navigate to product review list for first product as convenience
                    const firstProduct = order.products?.[0];
                    if (firstProduct?.productId || firstProduct?.id) {
                      const pid = firstProduct.productId || firstProduct.id;
                      try {
                        // expo-router style path
                        router.push({ pathname: '/feedback/list', params: { productId: pid } });
                      } catch (e) { }
                    }
                  }}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                  icon="replay"
                >
                  Đặt lại
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    try {
                      const oid = order.orderId || order.id;
                      if (!oid) {
                        Toast.show({ type: 'error', text1: 'Thiếu orderId để đánh giá' });
                        return;
                      }
                      router.push({ pathname: '/feedback/order', params: { orderId: oid } });
                    } catch (e) { }
                  }}
                  style={[
                    styles.actionButton,
                    // { backgroundColor: theme.colors.primary },
                  ]}
                  labelStyle={styles.actionButtonLabel}
                  disabled={reviewLocked[order.orderId]}
                >
                  {reviewLocked[order.orderId] ? 'Đã đánh giá' : 'Đánh giá'}
                </Button>
              </View>
            ) : null}
          </View>
        )}
      </Surface>
    );
  };

  const tabs = [
    { key: 'pending', label: 'Chờ xác nhận', icon: 'clock-outline' },
    { key: 'tracking', label: 'Theo dõi đơn', icon: 'truck-delivery-outline' },
    { key: 'history', label: 'Lịch sử đơn', icon: 'history' },
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Surface style={styles.emptyGradient} elevation={0}>
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={80}
          color={theme.colors.primary}
        />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Chưa có đơn hàng
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
        >
          Bạn chưa có đơn hàng nào. {'\n'}Hãy bắt đầu đặt món yêu thích của bạn!
        </Text>
      </Surface>
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator
          type="wave"
          size={60}
          color={theme.colors.primary}
          text="Đang tải đơn hàng..."
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header (no gradient) */}
      <View style={styles.headerGradient}>
        <Appbar.Header style={styles.transparentHeader}>
          <Appbar.Content
            title="Đơn hàng của tôi"
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {tabs.map((filter) => {
            const isSelected = selectedTab === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedTab(filter.key)}
                activeOpacity={0.7}
              >
                <Surface
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipActive,
                    isSelected && { borderColor: theme.colors.primary },
                  ]}
                  elevation={0}
                >
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={16}
                    color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="labelMedium"
                    style={[
                      styles.filterLabel,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Surface>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[theme.colors.primary]}
          />
        }
      >
        {filteredOrders.length === 0
          ? renderEmptyState()
          : filteredOrders.map((order) => {
            return renderOrderItem(order);
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: '#362415',
    fontSize: 22,
    fontWeight: '700',
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#E8F5E9',
  },
  filterLabel: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  orderCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderStatusBar: {
    height: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderHeaderInfo: {
    gap: 2,
    flex: 1,
  },
  orderId: {
    fontWeight: 'bold',
  },
  orderDate: {
    marginTop: 2,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {},
  totalAmount: {
    fontWeight: 'bold',
  },
  orderDetails: {
    paddingTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  timelineSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timelineItem: {
    flex: 1,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
  },
  itemsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  itemQuantityBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: { fontWeight: '700' },
  itemQuantityText: { fontWeight: '600', width: 28, textAlign: 'center' },
  itemInfo: {
    flex: 1,
  },
  itemName: { fontWeight: '400' },
  itemPrice: {},
  itemTotal: { fontWeight: '600', color: '#000' },
  toppingsList: {
    marginTop: 2,
    gap: 2,
  },
  toppingLine: {
    lineHeight: 16,
    fontSize: 12,
  },
  toppingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  toppingsText: {
    flex: 1,
  },
  customizationText: {
    marginTop: 2,
    fontSize: 12,
  },
  paymentSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paymentActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shippingSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  paymentLabel: {},
  shippingLabel: {},
  paymentMethod: {
    fontWeight: '600',
  },
  shippingAddress: {
    fontWeight: '600',
  },
  shippingAddressText: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyGradient: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  // timeline (inline) styles reused from modal naming
  timelineRowModal: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  timelineLeft: { alignItems: 'center', width: 18 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  // make the connector continuous by letting it overlap into next row slightly
  stick: { width: 2, flexGrow: 1, marginTop: 6, marginBottom: -4 },
  timelineContent: { flex: 1, paddingLeft: 8 },
});
