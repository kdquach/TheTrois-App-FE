import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Chip, Divider, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useProductStore } from '../../store/productStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';
import * as productApi from '../../api/productApi';

const { width, height } = Dimensions.get('window');

const SIZES = [
  { id: 'S', label: 'Nhỏ (S)', price: 0 },
  { id: 'M', label: 'Vừa (M)', price: 5000 },
  { id: 'L', label: 'Lớn (L)', price: 10000 },
];

const ICE_LEVELS = [
  { id: 0, label: 'Không đá', value: 0 },
  { id: 30, label: 'Ít đá (30%)', value: 30 },
  { id: 50, label: 'Vừa (50%)', value: 50 },
  { id: 100, label: 'Nhiều đá (100%)', value: 100 },
];

const SUGAR_LEVELS = [
  { id: 0, label: 'Không đường', value: 0 },
  { id: 30, label: 'Ít đường (30%)', value: 30 },
  { id: 50, label: 'Vừa (50%)', value: 50 },
  { id: 70, label: 'Nhiều (70%)', value: 70 },
  { id: 100, label: 'Full (100%)', value: 100 },
];

export default function ProductDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { fetchFeedbacks, stats } = useFeedbackStore();

  // Find product by id (string comparison)
  const product = products.find((p) => p.id === id || p.id === String(id));

  const [selectedSize, setSelectedSize] = useState('M');
  const [iceLevel, setIceLevel] = useState(50); // Number
  const [sugarLevel, setSugarLevel] = useState(50); // Number
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for toppings
  const [allToppings, setAllToppings] = useState([]);
  const [loadingToppings, setLoadingToppings] = useState(false);

  // Get topping IDs from product (array of strings)
  const productToppingIds = product?.toppings || [];

  // Filter toppings that belong to this product
  const productToppings = allToppings.filter((topping) => {
    const toppingId = topping.id || topping._id;
    return productToppingIds.includes(toppingId);
  });

  // Fetch all toppings from API
  useEffect(() => {
    const fetchToppings = async () => {
      setLoadingToppings(true);
      try {
        const data = await productApi.getToppings({ silentError: true });
        const toppingsList = Array.isArray(data)
          ? data
          : data?.results || data?.data || [];
        console.log('Fetched all toppings:', toppingsList);
        setAllToppings(toppingsList);
      } catch (error) {
        console.error('Error fetching toppings:', error);
        setAllToppings([]);
      } finally {
        setLoadingToppings(false);
      }
    };

    fetchToppings();
  }, []);

  useEffect(() => {
    console.log('Product:', product);
    console.log('Product topping IDs:', productToppingIds);
    console.log('Filtered product toppings:', productToppings);
    if (!product && products.length > 0) {
      console.warn('Product not found, going back');
      router.back();
    }
  }, [product, products, productToppings]);

  // Fetch feedback stats for this product
  useEffect(() => {
    if (product?.id || id) {
      const pid = product?.id || String(id);
      fetchFeedbacks({ productId: pid }).catch(() => {});
    }
  }, [product?.id, id]);

  if (!product) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <LoadingIndicator
          type="pulse"
          size={60}
          color={theme.colors.primary}
          text="Đang tải sản phẩm..."
        />
      </View>
    );
  }

  const getToppingsInfo = () => selectedToppings.map(toppingId => {
    const topping = productToppings.find(t => (t.id || t._id) === toppingId);
    return { id: topping?.id || topping?._id || 'Unknown', name: topping?.name || 'Unknown', price: topping?.price || 0 };
  });

  const calculateTotalPrice = () => {
    let total = product.price;
    const sizeExtra = SIZES.find((s) => s.id === selectedSize)?.price || 0;
    total += sizeExtra;

    // Calculate toppings price from product's toppings
    const toppingsTotal = selectedToppings.reduce((sum, toppingId) => {
      const topping = productToppings.find(
        (t) => (t.id || t._id) === toppingId
      );
      return sum + (topping?.price || 0);
    }, 0);
    total += toppingsTotal;
    return total * quantity;
  };

  const handleToggleTopping = (toppingId) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);

      // Tạo customization đúng chuẩn backend
      const customization = {
        size: selectedSize,
        ice: iceLevel,
        sugar: sugarLevel,
        description: `Size ${selectedSize}, ${iceLevel}% đá, ${sugarLevel}% đường`,
      };

      // Định dạng topping theo chuẩn BE [{ toppingId, quantity }]
      const toppingsPayload = selectedToppings.map((toppingId) => ({
        toppingId,
        quantity: 1,
      }));

      const cartItem = {
        productId: product.id || product._id,
        quantity,
        customization,
        toppings: toppingsPayload,
        note: '',
      };

      console.log('Sending cart item:', cartItem);

      await addToCart(cartItem); // Gọi store để thêm
      Toast.show({
        type: 'success',
        text1: 'Đã thêm vào giỏ hàng!',
        text2: `${product.name} x${quantity}`,
      });

      router.back();
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể thêm vào giỏ hàng',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header with Image */}
      <View style={styles.imageSection}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Back Button */}
        <Surface style={styles.backButton} elevation={4}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={() => router.back()}
          />
        </Surface>

        {/* Favorite Button */}
        <Surface style={styles.favoriteButton} elevation={4}>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            iconColor={isFavorite ? '#FF6B6B' : theme.colors.onSurface}
            size={24}
            onPress={() => setIsFavorite(!isFavorite)}
          />
        </Surface>

        {/* Product Info Overlay simplified */}
        <View style={styles.productInfoOverlay}>
          <Text variant="headlineSmall" style={styles.productTitle}>{product.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={18} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.ratingText}>{stats.average?.toFixed ? stats.average.toFixed(1) : stats.average}</Text>
            <Text variant="bodyMedium" style={styles.reviewCount} onPress={() => router.push({ pathname: '/feedback/list', params: { productId: product?.id || String(id) } })}>({stats.count} đánh giá)</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Mô tả</Text>
          </View>
          <Text
            variant="bodyLarge"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {product.description}
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Được pha chế từ những nguyên liệu tươi ngon nhất, mang đến hương vị
            độc đáo và khó quên. Thích hợp cho mọi thời điểm trong ngày!
          </Text>
        </Surface>

        {/* Size Selection */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cup" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Chọn size</Text>
          </View>
          <View style={styles.sizeRow}> 
            {SIZES.map((s) => {
              const active = selectedSize === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sizeTile, active && styles.sizeTileActive]}
                  onPress={() => setSelectedSize(s.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.sizeTileLabel, active && styles.sizeTileLabelActive]}>{s.id}</Text>
                  <Text style={[styles.sizeTileExtra, active && styles.sizeTileExtraActive]}>{s.price > 0 ? `+${formatCurrency(s.price)}` : '+0₫'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Surface>

        {/* Ice Level */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="snowflake" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Lượng đá: {iceLevel}%</Text>
          </View>
          <View style={styles.levelButtons}>
            {[0,50,75,100].map(level => (
              <Chip
                key={level}
                selected={iceLevel === level}
                onPress={() => setIceLevel(level)}
                style={[styles.levelChip,{ backgroundColor: '#eee' }, iceLevel === level && { backgroundColor: '#E8F5E9' }]}
                textStyle={[styles.levelChipText, iceLevel === level && { color: theme.colors.primary, fontWeight: '700' }]}
              >{level}%</Chip>
            ))}
          </View>
        </Surface>

        {/* Sugar Level */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="grain" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Lượng đường: {sugarLevel}%</Text>
          </View>
          <View style={styles.levelButtons}>
            {[0,50,70,100].map(level => (
              <Chip
                key={level}
                selected={sugarLevel === level}
                onPress={() => setSugarLevel(level)}
                style={[styles.levelChip,{ backgroundColor: '#eee' }, sugarLevel === level && { backgroundColor: '#E8F5E9' }]}
                textStyle={[styles.levelChipText, sugarLevel === level && { color: theme.colors.primary, fontWeight: '700' }]}
              >{level}%</Chip>
            ))}
          </View>
        </Surface>

        {/* Toppings */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="food" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Thêm topping</Text>
          </View>
          <View style={styles.toppingsColumn}>
            {loadingToppings ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <LoadingIndicator type="pulse" size={40} color={theme.colors.primary} text="Đang tải topping..." />
              </View>
            ) : productToppings.length > 0 ? (
              productToppings.map(topping => {
                const toppingId = topping.id || topping._id;
                const active = selectedToppings.includes(toppingId);
                return (
                  <Surface key={toppingId} style={[styles.toppingItem, active && styles.toppingItemActive]} elevation={0}>
                    <TouchableOpacity style={styles.toppingInner} onPress={() => handleToggleTopping(toppingId)} activeOpacity={0.85}>
                      <View style={styles.toppingTexts}>
                        <Text style={[styles.toppingName, active && styles.toppingNameActive]}>{topping.name}</Text>
                        <Text style={[styles.toppingPriceText, active && styles.toppingPriceTextActive]}>+{formatCurrency(topping.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  </Surface>
                );
              })
            ) : (
              <Text variant="bodyMedium" style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>Sản phẩm này không có topping đi kèm</Text>
            )}
          </View>
        </Surface>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Bar */}
      <Surface style={styles.bottomBar} elevation={0}>
        <View style={styles.bottomTopRow}>
          <View style={styles.totalColumn}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={[styles.totalPriceValue, { color: theme.colors.primary }]}>{formatCurrency(calculateTotalPrice())}</Text>
          </View>
          <Surface style={styles.modalQuantityContainer} elevation={0}>
            <IconButton icon="minus" size={16} iconColor={theme.colors.onSurface} style={styles.modalQtyBtn} disabled={quantity<=1} onPress={() => setQuantity(Math.max(1, quantity-1))} />
            <Text style={styles.modalQtyValue}>{quantity}</Text>
            <IconButton icon="plus" size={16} iconColor={theme.colors.onSurface} style={styles.modalQtyBtn} onPress={() => setQuantity(quantity+1)} />
          </Surface>
        </View>
        <Button mode="contained" onPress={handleAddToCart} disabled={loading} loading={loading} style={[styles.addToCartButtonFull,{ backgroundColor: theme.colors.primary }]} labelStyle={styles.addToCartLabel} icon={loading?undefined:'cart-plus'}>
          Thêm vào giỏ
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    height: height * 0.4,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    borderRadius: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    borderRadius: 20,
  },
  productInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  productTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  reviewCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    lineHeight: 24,
    marginBottom: 8,
  },
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeTile: { flex: 1, backgroundColor: '#eee', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  sizeTileActive: { backgroundColor: '#E8F5E9' },
  sizeTileLabel: { fontWeight: '700', fontSize: 13, color: '#362415', marginBottom: 2 },
  sizeTileLabelActive: { color: '#00ac45', fontWeight: '700' },
  sizeTileExtra: { fontSize: 12, color: '#604c4c' },
  sizeTileExtraActive: { color: '#00ac45', fontWeight: '700' },
  levelButtons: { flexDirection: 'row', gap: 10 },
  levelChip: { flex: 1 },
  levelChipText: { fontSize: 12 },
  toppingsColumn: { gap: 12 },
  toppingItem: { backgroundColor: '#F8F9FA', borderRadius: 12, overflow: 'hidden' },
  toppingItemActive: { backgroundColor: '#E8F5E9' },
  toppingInner: { padding: 12 },
  toppingTexts: { marginLeft: 0 },
  toppingName: { color: '#362415' },
  toppingNameActive: { color: '#00ac45', fontWeight: '700' },
  toppingPriceText: { color: '#604c4c', marginTop: 2 },
  toppingPriceTextActive: { color: '#00ac45', fontWeight: '700', marginTop: 2 },
  bottomSpacing: {
    height: 20,
  },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FFFFFF', gap: 12 },
  bottomTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalQuantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eeeeee', borderRadius: 18, paddingHorizontal: 6, paddingVertical: 2 },
  modalQtyBtn: { margin: 0, width: 14, height: 14 },
  modalQtyValue: { marginHorizontal: 8, minWidth: 14, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#362415' },
  totalColumn: { },
  totalLabel: { fontWeight: '600', color: '#362415', marginBottom: 2 },
  totalPriceValue: { fontWeight: '700', fontSize: 18 },
  addToCartButton: { borderRadius: 25, paddingHorizontal: 24 },
  addToCartButtonFull: { marginTop: 4, borderRadius: 25 },
  addToCartLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
