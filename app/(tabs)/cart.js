import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  IconButton,
  Divider,
  List,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';

export default function CartScreen() {
  const theme = useTheme();
  const {
    items,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCartStore();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      Toast.show({
        type: 'info',
        text1: 'Đã xóa sản phẩm',
        text2: 'Sản phẩm đã được xóa khỏi giỏ hàng',
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Giỏ hàng trống',
        text2: 'Vui lòng thêm sản phẩm vào giỏ hàng',
      });
      return;
    }

    // Navigate to checkout screen (implement later)
    Toast.show({
      type: 'success',
      text1: 'Đặt hàng thành công',
      text2: 'Đơn hàng của bạn đang được xử lý',
    });
    clearCart();
  };

  const renderCartItem = (item) => (
    <Card key={item.id} style={styles.cartItem}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Text variant="titleMedium" style={styles.itemName}>
            {item.name}
          </Text>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => {
              removeFromCart(item.id);
              Toast.show({
                type: 'info',
                text1: 'Đã xóa sản phẩm',
                text2: 'Sản phẩm đã được xóa khỏi giỏ hàng',
              });
            }}
          />
        </View>

        <Text variant="bodyMedium" style={styles.itemPrice}>
          {formatCurrency(item.price)}
        </Text>

        {item.toppings && item.toppings.length > 0 && (
          <View style={styles.toppingsContainer}>
            <Text variant="bodySmall" style={styles.toppingsLabel}>
              Topping:
            </Text>
            {item.toppings.map((topping, index) => (
              <Text key={index} variant="bodySmall" style={styles.topping}>
                • {topping.name} (+{formatCurrency(topping.price)})
              </Text>
            ))}
          </View>
        )}

        <View style={styles.quantityContainer}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
          />
          <Text variant="titleMedium" style={styles.quantity}>
            {item.quantity}
          </Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          />
        </View>

        <Text
          variant="titleMedium"
          style={[styles.subtotal, { color: theme.colors.primary }]}
        >
          Subtotal: {formatCurrency(item.price * item.quantity)}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Giỏ hàng (${getTotalItems()} món)`} />
        {items.length > 0 && (
          <Appbar.Action
            icon="delete-sweep"
            onPress={() => {
              clearCart();
              Toast.show({
                type: 'info',
                text1: 'Đã xóa tất cả',
                text2: 'Giỏ hàng đã được xóa sạch',
              });
            }}
          />
        )}
      </Appbar.Header>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Giỏ hàng trống
          </Text>
          <Text variant="bodyLarge" style={styles.emptySubtitle}>
            Thêm một số món trà sữa ngon nhé! 🧋
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(tabs)/home')}
            style={styles.shopButton}
          >
            Mua sắm ngay
          </Button>
        </View>
      ) : (
        <View style={styles.content}>
          <ScrollView style={styles.itemsList}>
            {items.map(renderCartItem)}
          </ScrollView>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <List.Item
                title="Tổng số món"
                right={() => (
                  <Text variant="titleMedium">{getTotalItems()}</Text>
                )}
              />
              <Divider />
              <List.Item
                title="Tổng tiền"
                right={() => (
                  <Text
                    variant="titleLarge"
                    style={[
                      styles.totalAmount,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {formatCurrency(getTotalPrice())}
                  </Text>
                )}
              />
              <Button
                mode="contained"
                onPress={handleCheckout}
                style={styles.checkoutButton}
              >
                Đặt hàng ngay
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontWeight: 'bold',
  },
  itemPrice: {
    marginBottom: 8,
  },
  toppingsContainer: {
    marginVertical: 8,
  },
  toppingsLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topping: {
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  quantity: {
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  subtotal: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
  },
  totalAmount: {
    fontWeight: 'bold',
  },
  checkoutButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
