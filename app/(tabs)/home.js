import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  Searchbar,
  Surface,
  Divider,
} from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { products, categories, loading, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào giỏ hàng',
      text2: `${product.name} đã được thêm vào giỏ hàng`,
    });
  };

  const renderProduct = (product, index) => (
    <Surface
      key={product.id}
      style={[styles.productCard, { width: cardWidth }]}
      elevation={3}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          console.log('Clicking product:', product.id, product.name);
          console.log('Navigating to:', `/product/${product.id}`);
          router.push(`/product/${product.id}`);
        }}
      >
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Card.Cover
              source={{ uri: product.image }}
              style={styles.productImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
              style={styles.imageOverlay}
            />
            <View style={styles.productBadges}>
              <Surface
                style={[
                  styles.priceBadge,
                  { backgroundColor: theme.colors.starbucksGold },
                ]}
                elevation={2}
              >
                <Text variant="labelSmall" style={styles.priceText}>
                  {formatCurrency(product.price)}
                </Text>
              </Surface>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text
              variant="titleSmall"
              style={[styles.productName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {product.name}
            </Text>
            <View style={styles.productRating}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={theme.colors.starbucksGold}
              />
              <Text
                variant="labelSmall"
                style={[
                  styles.ratingText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                4.8 (120+)
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.starbucksGreen },
              ]}
              labelStyle={styles.addButtonLabel}
              icon="plus-circle"
              compact
            >
              Thêm vào giỏ
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );
  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator
          type="pulse"
          size={60}
          color={theme.colors.starbucksGreen}
          text="Đang tải sản phẩm..."
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Hero Section với Starbucks style */}
      <LinearGradient
        colors={[theme.colors.starbucksGreen, '#2E7D32']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeText}>
                Chào buổi sáng! ☀️
              </Text>
              <Text variant="titleMedium" style={styles.headerSubtitle}>
                Khám phá menu trà sữa đặc biệt
              </Text>
            </View>
            <Surface style={styles.themeToggle} elevation={2}>
              <Button
                icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
                mode="text"
                onPress={toggleTheme}
                textColor="#FFFFFF"
                compact
              />
            </Surface>
          </View>

          {/* Featured Offer */}
          <Surface style={styles.offerCard} elevation={3}>
            <LinearGradient
              colors={[theme.colors.starbucksGold, '#B8860B']}
              style={styles.offerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.offerContent}>
                <MaterialCommunityIcons
                  name="star-circle"
                  size={24}
                  color="#FFFFFF"
                />
                <View style={styles.offerText}>
                  <Text variant="titleSmall" style={styles.offerTitle}>
                    Ưu đãi đặc biệt
                  </Text>
                  <Text variant="bodySmall" style={styles.offerDescription}>
                    Giảm 20% cho đơn hàng đầu tiên
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.starbucksGreen]}
            tintColor={theme.colors.starbucksGreen}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <View style={styles.content}>
          <Surface style={styles.searchContainer} elevation={1}>
            <Searchbar
              placeholder="Tìm kiếm trà sữa yêu thích..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={theme.colors.primary}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </Surface>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              variant="titleMedium"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Danh mục
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            <Chip
              selected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={
                selectedCategory === 'all'
                  ? { color: theme.colors.primary }
                  : {}
              }
            >
              Tất cả
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && {
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
                textStyle={
                  selectedCategory === category.id
                    ? { color: theme.colors.primary }
                    : {}
                }
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cup"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              variant="titleMedium"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Sản phẩm ({filteredProducts.length})
            </Text>
          </View>

          <View style={styles.productsGrid}>
            {filteredProducts.map((product, index) =>
              renderProduct(product, index)
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Starbucks-style Hero Section
  heroSection: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  themeToggle: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  offerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  offerGradient: {
    padding: 16,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerText: {
    marginLeft: 12,
    flex: 1,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  offerDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
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
    padding: 20,
    paddingTop: 30,
  },
  searchContainer: {
    marginBottom: 24,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: 'transparent',
    borderRadius: 25,
    paddingHorizontal: 8,
  },
  searchInput: {
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  categoriesContent: {
    paddingRight: 20,
    gap: 12,
  },
  categoryChip: {
    borderRadius: 25,
    paddingHorizontal: 4,
    backgroundColor: '#F5F5F5',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  card: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 12,
  },
  cardContent: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  productDescription: {
    lineHeight: 18,
    marginBottom: 8,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  addButton: {
    borderRadius: 25,
    paddingVertical: 4,
  },
  addButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
