import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Chip,
  Divider,
  RadioButton,
  Checkbox,
  IconButton,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { Stack, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useProductStore } from '../../store/productStore';
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

  // Find product by id (string comparison)
  const product = products.find((p) => p.id === id || p.id === String(id));

  const [selectedSize, setSelectedSize] = useState('M');
  const [iceLevel, setIceLevel] = useState(50); // Number instead of string
  const [sugarLevel, setSugarLevel] = useState(50); // Number instead of string
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
          color={theme.colors.starbucksGreen}
          text="Đang tải sản phẩm..."
        />
      </View>
    );
  }

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

  const handleAddToCart = () => {
    setLoading(true);

    // Build customization object matching backend schema
    const customization = {
      ice: iceLevel,
      sugar: sugarLevel,
      description: `Size ${selectedSize}, ${iceLevel}% đá, ${sugarLevel}% đường`,
    };

    const cartItem = {
      ...product,
      size: selectedSize,
      customization, // Store as object with ice/sugar numbers
      toppings: selectedToppings, // Store topping IDs
      quantity,
      finalPrice: calculateTotalPrice(),
    };

    console.log('Adding to cart:', cartItem);
    addToCart(cartItem);

    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Đã thêm vào giỏ hàng! 🎉',
        text2: `${product.name} x${quantity}`,
      });
      router.back();
    }, 500);
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
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.imageOverlay}
        />

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

        {/* Product Info Overlay */}
        <View style={styles.productInfoOverlay}>
          <Text variant="headlineMedium" style={styles.productTitle}>
            {product.name}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star"
              size={20}
              color={theme.colors.starbucksGold}
            />
            <Text variant="titleMedium" style={styles.ratingText}>
              4.8
            </Text>
            <Text variant="bodyMedium" style={styles.reviewCount}>
              (120+ đánh giá)
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={theme.colors.starbucksGreen}
            />
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Mô tả
            </Text>
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
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cup"
              size={24}
              color={theme.colors.starbucksGreen}
            />
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Chọn size
            </Text>
          </View>
          <View style={styles.optionsGrid}>
            {SIZES.map((size) => (
              <Surface
                key={size.id}
                style={[
                  styles.sizeOption,
                  selectedSize === size.id && {
                    backgroundColor: theme.colors.primaryContainer,
                    borderColor: theme.colors.starbucksGreen,
                  },
                ]}
                elevation={selectedSize === size.id ? 3 : 1}
              >
                <Button
                  onPress={() => setSelectedSize(size.id)}
                  mode="text"
                  textColor={
                    selectedSize === size.id
                      ? theme.colors.starbucksGreen
                      : theme.colors.onSurface
                  }
                  style={styles.sizeButton}
                >
                  <View style={styles.sizeContent}>
                    <Text variant="titleMedium" style={styles.sizeLabel}>
                      {size.label}
                    </Text>
                    {size.price > 0 && (
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.sizePrice,
                          { color: theme.colors.starbucksGold },
                        ]}
                      >
                        +{formatCurrency(size.price)}
                      </Text>
                    )}
                  </View>
                </Button>
              </Surface>
            ))}
          </View>
        </Surface>

        {/* Ice Level */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="snowflake"
              size={24}
              color={theme.colors.starbucksGreen}
            />
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Lượng đá
            </Text>
          </View>
          <View style={styles.radioGroup}>
            {ICE_LEVELS.map((level) => (
              <Surface key={level.id} style={styles.radioOption} elevation={0}>
                <RadioButton.Android
                  value={level.id}
                  status={iceLevel === level.id ? 'checked' : 'unchecked'}
                  onPress={() => setIceLevel(level.id)}
                  color={theme.colors.starbucksGreen}
                />
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface }}
                >
                  {level.label}
                </Text>
              </Surface>
            ))}
          </View>
        </Surface>

        {/* Sugar Level */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="grain"
              size={24}
              color={theme.colors.starbucksGreen}
            />
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Lượng đường
            </Text>
          </View>
          <View style={styles.radioGroup}>
            {SUGAR_LEVELS.map((level) => (
              <Surface key={level.id} style={styles.radioOption} elevation={0}>
                <RadioButton.Android
                  value={level.id}
                  status={sugarLevel === level.id ? 'checked' : 'unchecked'}
                  onPress={() => setSugarLevel(level.id)}
                  color={theme.colors.starbucksGreen}
                />
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface }}
                >
                  {level.label}
                </Text>
              </Surface>
            ))}
          </View>
        </Surface>

        {/* Toppings */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="food"
              size={24}
              color={theme.colors.starbucksGreen}
            />
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Thêm topping
            </Text>
          </View>
          <View style={styles.toppingsGrid}>
            {loadingToppings ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <LoadingIndicator
                  type="pulse"
                  size={40}
                  color={theme.colors.starbucksGreen}
                  text="Đang tải topping..."
                />
              </View>
            ) : productToppings.length > 0 ? (
              productToppings.map((topping) => {
                const toppingId = topping.id || topping._id;
                return (
                  <Surface
                    key={topping.id || topping._id}
                    style={[
                      styles.toppingOption,
                      selectedToppings.includes(toppingId) && {
                        backgroundColor: theme.colors.primaryContainer,
                        borderColor: theme.colors.starbucksGreen,
                      },
                    ]}
                    elevation={selectedToppings.includes(toppingId) ? 3 : 1}
                  >
                    <Checkbox.Android
                      status={
                        selectedToppings.includes(toppingId)
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => handleToggleTopping(toppingId)}
                      color={theme.colors.starbucksGreen}
                    />
                    <View style={styles.toppingContent}>
                      <Text
                        variant="titleSmall"
                        style={{ color: theme.colors.onSurface }}
                      >
                        {topping.name}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.toppingPrice,
                          { color: theme.colors.starbucksGold },
                        ]}
                      >
                        +{formatCurrency(topping.price)}
                      </Text>
                    </View>
                  </Surface>
                );
              })
            ) : (
              <Text
                variant="bodyMedium"
                style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}
              >
                Sản phẩm này không có topping đi kèm
              </Text>
            )}
          </View>
        </Surface>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Feedback */}
      <View style={styles.reviewSection}>
        <Link
          // Điều hướng đến màn hình Feedback List, truyền Product ID qua query
          // PHẢI ĐẢM BẢO THƯ MỤC app/feedback/[id].js TỒN TẠI
          href={{
            pathname: `/feedback/${id}`,
            params: { productId: id, productName: product.name },
          }}
          asChild
        >
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>
              Xem Bình Luận ({product.reviewCount || 0})
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Bottom Bar */}
      <Surface style={styles.bottomBar} elevation={8}>
        <View style={styles.quantitySection}>
          <Text
            variant="titleMedium"
            style={[styles.quantityLabel, { color: theme.colors.onSurface }]}
          >
            Số lượng
          </Text>
          <View style={styles.quantityControl}>
            <Surface style={styles.quantityButton} elevation={2}>
              <IconButton
                icon="minus"
                size={20}
                iconColor={theme.colors.starbucksGreen}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              />
            </Surface>
            <Text
              variant="titleLarge"
              style={[styles.quantityValue, { color: theme.colors.onSurface }]}
            >
              {quantity}
            </Text>
            <Surface style={styles.quantityButton} elevation={2}>
              <IconButton
                icon="plus"
                size={20}
                iconColor={theme.colors.starbucksGreen}
                onPress={() => setQuantity(quantity + 1)}
              />
            </Surface>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View>
            <Text
              variant="bodySmall"
              style={[
                styles.priceLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Tổng cộng
            </Text>
            <Text
              variant="headlineSmall"
              style={[
                styles.totalPrice,
                { color: theme.colors.starbucksGreen },
              ]}
            >
              {formatCurrency(calculateTotalPrice())}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleAddToCart}
            disabled={loading}
            style={[
              styles.addToCartButton,
              { backgroundColor: theme.colors.starbucksGreen },
            ]}
            labelStyle={styles.addToCartLabel}
            icon="cart-plus"
          >
            {loading ? (
              <LoadingIndicator type="wave" size={24} color="#FFFFFF" />
            ) : (
              'Thêm vào giỏ'
            )}
          </Button>
        </View>
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
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  description: {
    lineHeight: 24,
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  sizeButton: {
    width: '100%',
  },
  sizeContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sizeLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sizePrice: {
    fontSize: 12,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toppingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toppingOption: {
    width: (width - 72) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toppingInfo: {
    flex: 1,
    marginLeft: 8,
  },
  toppingIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toppingName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  toppingPrice: {
    fontSize: 12,
  },
  bottomSpacing: {
    height: 20,
  },
  bottomBar: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    borderRadius: 20,
  },
  quantityValue: {
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    marginBottom: 4,
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  addToCartButton: {
    borderRadius: 25,
    paddingHorizontal: 24,
  },
  addToCartLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewSection: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  reviewButton: {
    backgroundColor: '#137d5bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
