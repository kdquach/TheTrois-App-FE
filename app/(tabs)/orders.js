import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Appbar, 
  Card, 
  Text, 
  Chip, 
  ActivityIndicator,
  List,
  Divider 
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useOrderStore } from '../../store/orderStore';
import { formatCurrency, formatDate } from '../../utils/format';

const ORDER_STATUS_COLORS = {
  pending: '#FFA726',
  confirmed: '#42A5F5',
  preparing: '#FF7043',
  ready: '#66BB6A',
  completed: '#4CAF50',
  cancelled: '#EF5350',
};

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready: 'Sẵn sàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function OrdersScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { orders, loading, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filteredOrders = orders.filter(order => 
    selectedStatus === 'all' || order.status === selectedStatus
  );

  const renderOrderItem = (order) => (
    <Card key={order.id} style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <Text variant="titleMedium" style={styles.orderId}>
            Đơn hàng #{order.id}
          </Text>
          <Chip 
            mode="flat"
            textStyle={{ color: 'white' }}
            style={[
              styles.statusChip,
              { backgroundColor: ORDER_STATUS_COLORS[order.status] }
            ]}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Chip>
        </View>

        <Text variant="bodySmall" style={styles.orderDate}>
          {formatDate(order.createdAt)}
        </Text>

        <Divider style={styles.divider} />

        {order.items.map((item, index) => (
          <List.Item
            key={index}
            title={item.name}
            description={`${item.quantity}x ${formatCurrency(item.price)}`}
            right={() => (
              <Text variant="bodyMedium">
                {formatCurrency(item.price * item.quantity)}
              </Text>
            )}
          />
        ))}

        <Divider style={styles.divider} />

        <View style={styles.orderFooter}>
          <Text variant="bodyMedium">
            Phương thức thanh toán: {order.paymentMethod}
          </Text>
          <Text 
            variant="titleMedium" 
            style={[styles.totalAmount, { color: theme.colors.primary }]}
          >
            Tổng: {formatCurrency(order.totalAmount)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const statusFilters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'];

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Đơn hàng của tôi" />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {statusFilters.map(status => (
              <Chip
                key={status}
                selected={selectedStatus === status}
                onPress={() => setSelectedStatus(status)}
                style={styles.filterChip}
              >
                {status === 'all' ? 'Tất cả' : ORDER_STATUS_LABELS[status]}
              </Chip>
            ))}
          </ScrollView>

          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                Chưa có đơn hàng
              </Text>
              <Text variant="bodyLarge" style={styles.emptySubtitle}>
                Bạn chưa có đơn hàng nào. Hãy đặt trà sữa ngay nhé! 🧋
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.map(renderOrderItem)}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  content: {
    padding: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
  },
  statusChip: {
    borderRadius: 16,
  },
  orderDate: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalAmount: {
    fontWeight: 'bold',
  },
});