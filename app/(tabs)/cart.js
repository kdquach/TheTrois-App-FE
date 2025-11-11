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
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAddressStore } from '../../store/addressStore';
import { useOrderStore } from '../../store/orderStore';
import EditCartItemModal from '../cart/EditCartItemModal';

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
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  

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

  // bỏ chọn nhiều sản phẩm: không còn checkbox/select-all

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
      
  console.log("đây là item",items);
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
      customization: {
        size: item.customization?.size || 'S',
        description: item.customization?.description || '',
      },
    }));
    const payload = {
      shippingAddress: orderAddress,
      products,
      totalAmount: cart.totalPrice, // tổng của giỏ hàng
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
    <Swipeable
      key={item.id}
      renderRightActions={() => (
        <View style={[styles.swipeDelete, { backgroundColor: theme.colors.dangerBright }]}>
          <IconButton
            icon="delete"
            iconColor="#fff"
            size={20}
            onPress={() => setConfirmDeleteId(item.id)}
          />
        </View>
      )}
      overshootRight={false}
    >
      <Surface style={styles.cartItem} elevation={0}>
        <View style={styles.itemContainer}>
        {/* Image column */}
        <View style={styles.itemImageContainer}>
          <Avatar.Image
            source={{ uri: item.image || 'https://via.placeholder.com/80' }}
            size={64}
            style={[styles.itemImage, { borderRadius: 10 }]}
          />
        </View>

        {/* Details column */}
        <View style={styles.itemDetails}>
          {/* Title row */}
          <View style={styles.itemHeader}>
            <Text
              variant="titleMedium"
              style={[styles.itemName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>

          {(() => {
            const customization = item.customization;
            if (!customization) return null;
            const description = customization.description?.trim();
            const size = customization.size || 'S';
            const ice = customization.ice ?? 100;
            const sugar = customization.sugar ?? 100;
            const toppingNames = (item.toppings || [])
              .map((t) => t?.name)
              .filter(Boolean)
              .join(', ');
            const base = description || `Size ${size}, ${ice}% đá, ${sugar}% đường`;
            const full = toppingNames ? `${base}, ${toppingNames}` : base;
            return (
              <Text
                variant="labelSmall"
                style={[styles.customizationText, { color: theme.colors.onSurfaceVariant, opacity: 0.6 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {full}
              </Text>
            );
          })()}

          {/* Qty and subtotal */}
          <View style={styles.quantityAndTotal}>
            <Surface style={styles.quantityContainer} elevation={0}>
              <IconButton
                icon="minus"
                size={16}
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              />
              <Text
                variant="titleSmall"
                style={[styles.quantity, { color: theme.colors.onSurface }]}
              >
                {item.quantity}
              </Text>
              <IconButton
                icon="plus"
                size={16}
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
              />
            </Surface>
            <Text
              variant="titleLarge"
              style={[styles.subtotal, { color: theme.colors.primary }]}
            >
              {formatCurrency(getItemTotalPrice(item))}
            </Text>
          </View>

          {/* Chỉnh sửa */}
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.primary, marginTop: 4 }}
            onPress={() => handleEditItem(item)}
          >
            Chỉnh sửa
          </Text>
        </View>
      </View>
      </Surface>
    </Swipeable>
  );

  const Section = ({ title, icon, children }) => (
    <Surface style={styles.sectionCard} elevation={0}>
      <View style={styles.sectionHeader}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.primary}
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
      {/* Header giống Address */}
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Giỏ hàng của bạn" />
      </Appbar.Header>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#F5F5F5', '#E8F5E8']}
            style={styles.emptyGradient}
          >
            <MaterialCommunityIcons
              name="cart-outline"
              size={100}
              color={theme.colors.primary}
              style={styles.emptyIcon}
            />
            <Text
              variant="headlineMedium"
              style={[
                styles.emptyTitle,
                { color: theme.colors.primary },
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
            </Text>
            <Surface style={styles.shopButtonContainer} elevation={3}>
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)/home')}
                style={[
                  styles.shopButton,
                  { backgroundColor: theme.colors.primary },
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
              { paddingBottom: 140 },
            ]}
          >
            {/* Row 1: Title */}
            <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 8, color: theme.colors.onSurface }}>
              Danh sách sản phẩm
            </Text>

            {/* Row 2: Clear cart only */}
            {items.length > 0 && (
              <View style={{ alignItems: 'flex-end', marginBottom: 4 }}>
                <Button
                  icon="delete-sweep"
                  mode="text"
                  textColor={theme.colors.onBackground}
                  onPress={() => {
                    clearCart();
                    Toast.show({ type: 'info', text1: 'Đã xóa tất cả', text2: 'Giỏ hàng đã được xóa sạch' });
                  }}
                >
                  Xóa giỏ hàng
                </Button>
              </View>
            )}

            {/* Row 3: Items list */}
            <View style={{ marginTop: 8 }}>
              {items.map(renderCartItem)}
            </View>

            {/* Row 4: Address row */}
            <Surface style={styles.addressRow} elevation={0}>
              <View style={[styles.addressIconWrapper, { backgroundColor: `${theme.colors.dangerBright}15` }] }>
                <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.dangerBright} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.onSurface, marginBottom: 2 }}>Địa chỉ giao hàng</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
                  {[selectedAddress?.street, selectedAddress?.ward?.name, selectedAddress?.district?.name, selectedAddress?.city?.name].filter(Boolean).join(', ') || 'Chưa có địa chỉ' }
                </Text>
              </View>
              <IconButton icon="chevron-right" onPress={() => router.push({ pathname: '/addresses', params: { from: 'cart' } })} />
            </Surface>

            {/* Row 5: Payment methods */}
            <Surface style={styles.paymentRow} elevation={0}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.onSurface, marginBottom: 8 }}>Phương thức thanh toán</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.payOption, paymentMethod === 'cash' && styles.payOptionActive, paymentMethod === 'cash' && { borderColor: theme.colors.primary }]}>
                  <MaterialCommunityIcons name="cash" size={18} color={paymentMethod === 'cash' ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                  <Text style={[styles.payOptionText, { color: paymentMethod === 'cash' ? theme.colors.primary : theme.colors.onSurface }]} onPress={() => setPaymentMethod('cash')}>
                    Thanh toán khi nhận hàng
                  </Text>
                </View>
                <View style={[styles.payOption, paymentMethod === 'vnpay' && styles.payOptionActive, paymentMethod === 'vnpay' && { borderColor: theme.colors.primary }]}>
                  <View style={styles.vnPayLogoCircle} />
                  <Text style={[styles.payOptionText, { color: paymentMethod === 'vnpay' ? theme.colors.primary : theme.colors.onSurface }]} onPress={() => setPaymentMethod('vnpay')}>
                    VNPay
                  </Text>
                </View>
              </View>
            </Surface>

            <Section title="Ghi chú cho đơn hàng">
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

          <Surface
            style={styles.summaryOverlay}
            elevation={0}
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
                    style={styles.totalLabel}
                  >
                    Tổng cộng
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={[styles.totalAmount, { color: theme.colors.primary }]}
                  >
                    {formatCurrency(cart.totalPrice)}
                  </Text>
                </View>
              </View>
              <Surface style={styles.checkoutButtonContainer} elevation={0}>
                <Button
                  mode="contained"
                  onPress={handleCheckout}
                  style={[
                    styles.checkoutButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  labelStyle={styles.checkoutButtonLabel}
                  icon="credit-card"
                >
                  Đặt đơn
                </Button>
              </Surface>
            </LinearGradient>
          </Surface>
          <EditCartItemModal
            visible={!!editingItem}
            item={editingItem}
            onDismiss={() => setEditingItem(null)}
          />
          <Portal>
            <Dialog
              visible={confirmDeleteId !== null}
              onDismiss={() => setConfirmDeleteId(null)}
            >
              <Dialog.Title>Xóa sản phẩm?</Dialog.Title>
              <Dialog.Content>
                <Text>Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setConfirmDeleteId(null)}>Hủy</Button>
                <Button
                  onPress={() => {
                    if (confirmDeleteId) {
                      removeCartItem(confirmDeleteId);
                      Toast.show({
                        type: 'info',
                        text1: 'Đã xóa sản phẩm',
                        text2: 'Sản phẩm đã được xóa khỏi giỏ hàng',
                      });
                    }
                    setConfirmDeleteId(null);
                  }}
                  textColor={theme.colors.dangerBright}
                >
                  Xóa
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
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
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectAllLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  selectCol: {
    justifyContent: 'center',
    marginRight: 4,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  itemImage: {
    backgroundColor: '#FFFFFF',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    backgroundColor: '#eeeeee',
    borderRadius: 18,
    paddingHorizontal: 6,
  },
  quantityButton: {
    margin: 0,
    width: 14,
    height: 14,
  },
  quantity: {
    marginHorizontal: 8,
    minWidth: 12,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  subtotal: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButtonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  checkoutButton: {
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
  swipeDelete: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
  },
  addressRow: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRow: {
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  payOptionActive: {
    backgroundColor: '#F5F9F6',
  },
  payOptionText: {
    fontWeight: '600',
  },
  vnPayLogoCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E90FF',
  },
});
