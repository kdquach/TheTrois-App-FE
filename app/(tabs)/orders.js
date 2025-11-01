import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Appbar, Text, Surface, Divider, Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrderStore } from '../../store/orderStore';
import { formatCurrency, formatDate } from '../../utils/format';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    icon: 'clock-outline',
    color: '#FF9800',
    gradient: ['#FFA726', '#FF9800'],
  },
  confirmed: {
    label: 'Đã xác nhận',
    icon: 'check-circle',
    color: '#2196F3',
    gradient: ['#42A5F5', '#2196F3'],
  },
  preparing: {
    label: 'Đang pha chế',
    icon: 'coffee-maker',
    color: '#00704A',
    gradient: ['#00906A', '#00704A'],
  },
  ready: {
    label: 'Sẵn sàng lấy',
    icon: 'bell-ring',
    color: '#D4AF37',
    gradient: ['#E0C44E', '#D4AF37'],
  },
  completed: {
    label: 'Hoàn thành',
    icon: 'check-all',
    color: '#4CAF50',
    gradient: ['#66BB6A', '#4CAF50'],
  },
  cancelled: {
    label: 'Đã hủy',
    icon: 'close-circle',
    color: '#F44336',
    gradient: ['#EF5350', '#F44336'],
  },
};

export default function OrdersScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const { orders, loading, fetchOrders } = useOrderStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders(selectedStatus);
    }, [selectedStatus])
  );

  const toggleOrderExpanded = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const filteredOrders = orders.filter(
    (order) => order.status === selectedStatus
  );

  const renderOrderTimeline = (status) => {
    const statuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'completed',
    ];
    const currentIndex = statuses.indexOf(status);

    return (
      <View style={styles.timelineContainer}>
        {statuses.map((s, index) => {
          const config = ORDER_STATUS_CONFIG[s];
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={s} style={styles.timelineItem}>
              <View style={styles.timelineStep}>
                <Surface
                  style={[
                    styles.timelineIcon,
                    {
                      backgroundColor: isActive ? config.color : '#E0E0E0',
                    },
                  ]}
                  elevation={isActive ? 3 : 0}
                >
                  <MaterialCommunityIcons
                    name={config.icon}
                    size={isCurrent ? 20 : 16}
                    color={isActive ? '#FFFFFF' : '#9E9E9E'}
                  />
                </Surface>
                {index < statuses.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: isActive ? config.color : '#E0E0E0',
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderOrderItem = (order) => {

    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['pending']; // fallback
    const isExpanded = expandedOrders.has(order.orderId);

    return (
      <Surface key={order.orderId} style={styles.orderCard} elevation={3}>
        <LinearGradient
          colors={statusConfig.gradient}
          style={styles.orderStatusBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleOrderExpanded(order.orderId)}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Surface
                style={[
                  styles.orderIconContainer,
                  { backgroundColor: `${statusConfig.color}15` },
                ]}
                elevation={0}
              >
                <MaterialCommunityIcons
                  name="coffee"
                  size={24}
                  color={statusConfig.color}
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
                  {formatDate(order.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.orderHeaderRight}>
              <Surface
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.color },
                ]}
                elevation={2}
              >
                <MaterialCommunityIcons
                  name={statusConfig.icon}
                  size={14}
                  color="#FFFFFF"
                />
                <Text variant="labelSmall" style={styles.statusText}>
                  {statusConfig.label}
                </Text>
              </Surface>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
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
            style={[styles.totalAmount, { color: theme.colors.starbucksGreen }]}
          >
            {formatCurrency(order.totalAmount)}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.orderDetails}>
            <Divider style={styles.divider} />

            {/* Timeline */}
            {order.status !== 'cancelled' && (
              <View style={styles.timelineSection}>
                <Text variant="labelLarge" style={styles.sectionTitle}>
                  Trạng thái đơn hàng
                </Text>
                {renderOrderTimeline(order.status)}
              </View>
            )}

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
                      { backgroundColor: theme.colors.starbucksGreen },
                    ]}
                    elevation={1}
                  >
                    <Text variant="labelSmall" style={styles.quantityText}>
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
                    {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                      <View style={styles.toppingsList}>
                        {item.toppings.map((t, idx) => (
                          <Text
                            key={idx}
                            variant="labelSmall"
                            style={[styles.toppingLine, { color: theme.colors.onSurfaceVariant, opacity: 0.6 }]}
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
                        style={[styles.customizationText, { color: theme.colors.onSurfaceVariant, opacity: 0.6 }]}
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
                      { color: theme.colors.starbucksGreen },
                    ]}
                  >
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            <Divider style={styles.divider} />

            {/* Shipping Address */}
            {order.shippingAddress ? (
              <View style={styles.shippingSection}>
                <View style={styles.shippingRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="labelSmall"
                    style={[
                      styles.shippingLabel,
                      { color: theme.colors.onSurfaceVariant, opacity: 0.7 },
                    ]}
                  >
                    Địa chỉ giao hàng
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  style={[styles.shippingAddress, { color: theme.colors.onSurfaceVariant, opacity: 0.85 }]}
                  numberOfLines={2}
                >
                  {order.shippingAddress}
                </Text>
              </View>
            ) : null}

            {/* Payment Info */}
            <View style={styles.paymentSection}>
              <View style={styles.paymentRow}>
                <MaterialCommunityIcons
                  name="credit-card-outline"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="labelSmall"
                  style={[
                    styles.paymentLabel,
                    { color: theme.colors.onSurfaceVariant, opacity: 0.7 },
                  ]}
                >
                  Phương thức thanh toán
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.paymentMethod}>
                {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thanh toán online'}
              </Text>
            </View>

            {/* Action Buttons */}
            {order.status === 'completed' && (
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => { }}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                  icon="replay"
                >
                  Đặt lại
                </Button>
                <Button
                  mode="contained"
                  onPress={() => { }}
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.starbucksGreen },
                  ]}
                  labelStyle={styles.actionButtonLabel}
                  icon="star"
                >
                  Đánh giá
                </Button>
              </View>
            )}
          </View>
        )}
      </Surface>
    );
  };

  const statusFilters = [
    { key: 'pending', label: 'Chờ', icon: 'clock-outline' },
    { key: 'confirmed', label: 'Đã nhận', icon: 'check-circle' },
    { key: 'preparing', label: 'Pha chế', icon: 'coffee-maker' },
    { key: 'ready', label: 'Sẵn sàng', icon: 'bell-ring' },
    { key: 'completed', label: 'Hoàn thành', icon: 'check-all' },
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[`${theme.colors.starbucksGreen}10`, 'transparent']}
        style={styles.emptyGradient}
      >
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={80}
          color={theme.colors.starbucksGreen}
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
      </LinearGradient>
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator
          type="wave"
          size={60}
          color={theme.colors.starbucksGreen}
          text="Đang tải đơn hàng..."
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.starbucksGreen, '#00906A']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
          {statusFilters.map((filter) => {
            const isSelected = selectedStatus === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedStatus(filter.key)}
                activeOpacity={0.7}
              >
                <Surface
                  style={[
                    styles.filterChip,
                    isSelected && {
                      backgroundColor: theme.colors.starbucksGold,
                    },
                  ]}
                  elevation={isSelected ? 3 : 1}
                >
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={16}
                    color={isSelected ? '#FFFFFF' : theme.colors.onSurface}
                  />
                  <Text
                    variant="labelMedium"
                    style={[
                      styles.filterLabel,
                      {
                        color: isSelected ? '#FFFFFF' : theme.colors.onSurface,
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
      </LinearGradient>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[theme.colors.starbucksGreen]}
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
    paddingTop: 44,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    paddingVertical: 12,
    gap: 12,
  },
  itemQuantityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  itemPrice: {},
  itemTotal: {
    fontWeight: 'bold',
  },
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
});
