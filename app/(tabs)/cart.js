import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  IconButton,
  Divider,
  List,
  Surface,
  Avatar,
  Chip,
  TextInput,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';
import ShippingAddressSection from '../checkout/index';
import { useCallback, useEffect, useState } from 'react';
import PaymentMethodSelector from '../checkout/PaymentMethodSelector';
import { useAuthStore } from '../../store/authStore';
import { useAddressStore } from '../../store/addressStore';
import { useOrderStore } from '../../store/orderStore';
import EditCartItemModal from './EditCartItemModal';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const theme = useTheme();
  const {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getItemTotalPrice,
  } = useCartStore();
  const items = cart?.items || [];

  const getTotalItems = () =>
    items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const { user } = useAuthStore();
  const { selectedAddress, setSelectedAddress } = useAddressStore();
  const { createOrder } = useOrderStore();
  const [editingItem, setEditingItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showSummary, setShowSummary] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [orderNote, setOrderNote] = useState('');

  useEffect(() => {
    if (user?.addresses) {
      const address = user.addresses.find((a) => a.isDefault);
      setSelectedAddress(address || null);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeCartItem(itemId);
      Toast.show({
        type: 'info',
        text1: 'Đã xóa sản phẩm',
        text2: 'Sản phẩm đã được xóa khỏi giỏ hàng',
      });
    } else {
      updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Giỏ hàng trống',
        text2: 'Vui lòng thêm sản phẩm vào giỏ hàng',
      });
      return;
    }
    const orderAddress = [
      selectedAddress?.street,
      selectedAddress?.ward?.name,
      selectedAddress?.district?.name,
      selectedAddress?.city?.name,
    ]
      .filter(Boolean)
      .join(', ');

    const products = items.map((item) => ({
      productId: item.productId?._id || item.productId,
      name: item.name,
      price: item.finalPrice || item.price,
      quantity: item.quantity,
      toppings:
        item.toppings?.map((t) => {
          // FIX CỨNG: Luôn lấy id từ bên trong object toppingId
          const toppingId =
            t.toppingId?.id || t.toppingId?._id || t.id || t._id;

          return {
            toppingId: toppingId,
            name: t.name,
            price: t.price,
          };
        }) || [],
      customization: item.customization?.description || null,
    }));

    const payload = {
      shippingAddress: orderAddress,
      products,
      totalAmount: cart.totalPrice, // lấy trực tiếp từ BE
      note: orderNote,
      payment: { method: paymentMethod },
    };

    const res = await createOrder(payload);
    if (res?.success) {
      Toast.show({
        type: 'success',
        text1: 'Đặt hàng thành công',
        text2: 'Đơn hàng của bạn đang được xử lý',
      });
      clearCart();
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const renderCartItem = (item) => (
    <Surface key={item.id} style={styles.cartItem} elevation={2}>
      <View style={styles.itemContainer}>
        <View style={styles.itemImageContainer}>
          <Avatar.Image
            source={{ uri: item.image || 'https://via.placeholder.com/80' }}
            size={80}
            style={styles.itemImage}
          />
          <Surface
            style={[
              styles.quantityBadge,
              { backgroundColor: theme.colors.starbucksGreen },
            ]}
            elevation={2}
          >
            <Text variant="labelSmall" style={styles.quantityBadgeText}>
              {item.quantity}
            </Text>
          </Surface>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text
              variant="titleMedium"
              style={[styles.itemName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View style={styles.itemActions}>
              {/* Nút Edit - MỚI */}
              <Surface style={styles.editButton} elevation={1}>
                <IconButton
                  icon="pencil"
                  size={18}
                  iconColor={theme.colors.starbucksGreen}
                  onPress={() => handleEditItem(item)}
                />
              </Surface>
              <Surface style={styles.deleteButton} elevation={1}>
                <IconButton
                  icon="close"
                  size={18}
                  iconColor={theme.colors.error}
                  onPress={() => removeCartItem(item.id)}
                />
              </Surface>
            </View>
          </View>

          <Text
            variant="bodyMedium"
            style={[styles.itemPrice, { color: theme.colors.starbucksGreen }]}
          >
            {formatCurrency(item.finalPrice || item.price)} / ly
          </Text>

          {item.toppings?.length > 0 && (
            <View style={styles.toppingsList}>
              {item.toppings.map((t, idx) => (
                <Text
                  key={idx}
                  variant="labelSmall"
                  style={[
                    styles.toppingLine,
                    { color: theme.colors.onSurfaceVariant, opacity: 0.6 },
                  ]}
                  numberOfLines={1}
                >
                  {t.name} +{formatCurrency(t.price || 0)}
                </Text>
              ))}
            </View>
          )}

          {/* Customization - Hiển thị linh hoạt */}
          {(() => {
            const customization = item.customization;
            if (!customization) return null;

            const description = customization.description?.trim();

            if (description) {
              return (
                <Text
                  variant="labelSmall"
                  style={[
                    styles.customizationText,
                    { color: theme.colors.onSurfaceVariant, opacity: 0.6 },
                  ]}
                  numberOfLines={2}
                >
                  📝 {description}
                </Text>
              );
            }

            const size = customization.size || 'S';
            const ice = customization.ice ?? 100;
            const sugar = customization.sugar ?? 100;

            return (
              <Text
                variant="labelSmall"
                style={[
                  styles.customizationText,
                  { color: theme.colors.onSurfaceVariant, opacity: 0.6 },
                ]}
                numberOfLines={2}
              >
                📝 Size {size}, {ice}% đá, {sugar}% đường
              </Text>
            );
          })()}

          <View style={styles.quantityAndTotal}>
            <Surface style={styles.quantityContainer} elevation={1}>
              <IconButton
                icon="minus"
                size={18}
                iconColor={theme.colors.starbucksGreen}
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              />
              <Text
                variant="titleMedium"
                style={[styles.quantity, { color: theme.colors.onSurface }]}
              >
                {item.quantity}
              </Text>
              <IconButton
                icon="plus"
                size={18}
                iconColor={theme.colors.starbucksGreen}
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
              />
            </Surface>
            <Text
              variant="titleLarge"
              style={[styles.subtotal, { color: theme.colors.starbucksGreen }]}
            >
              {formatCurrency(getItemTotalPrice(item))}
            </Text>
          </View>
        </View>
      </View>
    </Surface>
  );

  const Section = ({ title, icon, children }) => (
    <Surface style={styles.sectionCard} elevation={2}>
      <View style={styles.sectionHeader}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.starbucksGreen}
          />
        )}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          {title}
        </Text>
      </View>
      {children}
    </Surface>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.starbucksGreen, '#2E7D32']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              🛒 Giỏ hàng của bạn
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {getTotalItems()} món đã chọn
            </Text>
          </View>
          {items.length > 0 && (
            <Surface style={styles.clearButton} elevation={2}>
              <Button
                icon="delete-sweep"
                mode="text"
                textColor="#FFFFFF"
                onPress={() => {
                  clearCart();
                  Toast.show({
                    type: 'info',
                    text1: 'Đã xóa tất cả',
                    text2: 'Giỏ hàng đã được xóa sạch',
                  });
                }}
                compact
              >
                Xóa tất cả
              </Button>
            </Surface>
          )}
        </View>
      </LinearGradient>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#F5F5F5', '#E8F5E8']}
            style={styles.emptyGradient}
          >
            <MaterialCommunityIcons
              name="cart-outline"
              size={100}
              color={theme.colors.starbucksGreen}
              style={styles.emptyIcon}
            />
            <Text
              variant="headlineMedium"
              style={[
                styles.emptyTitle,
                { color: theme.colors.starbucksGreen },
              ]}
            >
              Giỏ hàng trống
            </Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.emptySubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Hãy thêm những ly trà sữa ngon tuyệt{'\n'}vào giỏ hàng của bạn!
              🧋✨
            </Text>
            <Surface style={styles.shopButtonContainer} elevation={3}>
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)/home')}
                style={[
                  styles.shopButton,
                  { backgroundColor: theme.colors.starbucksGreen },
                ]}
                labelStyle={styles.shopButtonLabel}
                icon="shopping"
              >
                Khám phá menu
              </Button>
            </Surface>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 28 + (overlayHeight || 0) },
            ]}
            onScroll={(e) => {
              const { contentOffset, layoutMeasurement, contentSize } =
                e.nativeEvent;
              setShowSummary(
                contentOffset.y + layoutMeasurement.height >=
                  contentSize.height - 1
              );
            }}
            scrollEventThrottle={16}
          >
            <Section title="Danh sách đồ uống" icon="format-list-bulleted">
              {items.map(renderCartItem)}
            </Section>

            <ShippingAddressSection address={selectedAddress} />

            <Section title="Phương thức thanh toán" icon="credit-card-outline">
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </Section>

            <Section title="Ghi chú cho đơn hàng" icon="note-text-outline">
              <TextInput
                mode="outlined"
                placeholder="Nếu có..."
                value={orderNote}
                onChangeText={setOrderNote}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: 'transparent' }}
                outlineStyle={{ borderRadius: 12 }}
                maxLength={200}
                right={<TextInput.Affix text={`${orderNote.length}/200`} />}
              />
            </Section>
          </ScrollView>

          {showSummary && (
            <Surface
              style={styles.summaryOverlay}
              elevation={10}
              onLayout={(e) => setOverlayHeight(e.nativeEvent.layout.height)}
            >
              <LinearGradient
                colors={[theme.colors.surface, theme.colors.primaryContainer]}
                style={styles.summaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.summaryDetails}>
                  <View style={styles.summaryRow}>
                    <Text
                      variant="titleLarge"
                      style={[
                        styles.totalLabel,
                        { color: theme.colors.starbucksGreen },
                      ]}
                    >
                      Tổng thanh toán
                    </Text>
                    <Text
                      variant="headlineSmall"
                      style={[
                        styles.totalAmount,
                        { color: theme.colors.starbucksGreen },
                      ]}
                    >
                      {formatCurrency(cart.totalPrice)}{' '}
                      {/* Hoặc getTotalPriceFE() nếu muốn tự tính */}
                    </Text>
                  </View>
                </View>

                <Surface style={styles.checkoutButtonContainer} elevation={2}>
                  <Button
                    mode="contained"
                    onPress={handleCheckout}
                    style={[
                      styles.checkoutButton,
                      { backgroundColor: theme.colors.starbucksGreen },
                    ]}
                    labelStyle={styles.checkoutButtonLabel}
                    icon="credit-card"
                  >
                    Thanh toán ngay
                  </Button>
                </Surface>
              </LinearGradient>
            </Surface>
          )}
          <EditCartItemModal
            visible={!!editingItem}
            item={editingItem}
            onDismiss={() => setEditingItem(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  clearButton: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 24,
    lineHeight: 16,
    fontSize: 12,
  },
  shopButtonContainer: {
    marginTop: 2,
    fontSize: 12,
    overflow: 'hidden',
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 25,
  },
  shopButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  scrollContentWithOverlay: {
    paddingBottom: 160, // để tránh overlay che nội dung khi hiện
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    marginLeft: 8,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  cartItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  itemImage: {
    backgroundColor: '#F5F5F5',
  },
  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  deleteButton: {
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
  },
  itemPrice: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 15,
  },
  toppingsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  toppingsInlineText: {
    flex: 1,
  },
  customizationText: {
    marginTop: 2,
  },
  toppingsList: {
    marginTop: 2,
    gap: 2,
  },
  toppingLine: {
    lineHeight: 18,
  },
  toppingsLabelText: {
    fontWeight: '600',
  },
  toppingsPrice: {
    fontWeight: '600',
  },
  toppingsMore: {
    fontStyle: 'italic',
  },
  customizationLabel: {
    fontStyle: 'italic',
  },
  toppingsContainer: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  toppingsLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  topping: {
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  quantityAndTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 6,
  },
  quantityButton: {
    margin: 0,
    width: 36,
    height: 36,
  },
  quantity: {
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtotal: {
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: 'rgba(0, 112, 74, 0.2)',
  },
  summaryDetails: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '600',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontWeight: 'bold',
  },
  checkoutButtonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  checkoutButton: {
    paddingVertical: 12,
    borderRadius: 25,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
  },
});
