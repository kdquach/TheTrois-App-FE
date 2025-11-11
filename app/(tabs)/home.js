import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { Text, Button, Chip, Surface } from 'react-native-paper';
import { SearchBar } from '@rneui/themed';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';
import Icon from '../../components/Icon';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  // sticky dropdown removed in favor of native stickyHeaderIndices

  const { products, categories, loading, fetchProducts } = useProductStore();
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

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
    // Build a minimal payload for quick-add to avoid API 400 from unexpected shape
    const payload = {
      productId: product.id || product._id,
      quantity: 1,
      customization: {
        size: 'S',
        ice: 100,
        sugar: 100,
        description: '',
      },
      toppings: [],
      note: '',
    };

    addToCart(payload);
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào giỏ hàng',
      text2: `${product.name} đã được thêm vào giỏ hàng`,
    });
  };

  const getSales = (p) => {
    return (
      p?.sales || p?.sold || p?.orderCount || p?.orders || p?.totalSold || 0
    );
  };

  const renderProduct = (product, index) => (
    <Surface
      key={product.id}
      style={[styles.productCard, { width: cardWidth }]}
      elevation={0}
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
            <Image source={{ uri: product.image }} style={styles.productImage} />
            {getSales(product) > 50 ? (
              <View style={styles.badgeTopLeft}>
                <Text style={styles.badgeText}>Bán chạy</Text>
              </View>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              style={[styles.fabAdd, { backgroundColor: theme.colors.primary }]}
            >
              <Icon name="Plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            <Text
              style={[styles.productName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {product.name}
            </Text>
            <Text style={[styles.price, { color: theme.colors.onSurface }]}>
              {formatCurrency(product.price)}
            </Text>
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

  // Greeting helper
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Chào buổi sáng';
    if (h < 13) return 'Chào buổi trưa';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const displayName = () => {
    return (
      user?.name || user?.fullName || (user?.email ? user.email.split('@')[0] : 'bạn')
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Greeting/Search Header (outside ScrollView) */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.content, styles.fixedInner]}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>
                {greeting()}
              </Text>
              <Text style={styles.greetingName}>{displayName()}</Text>
            </View>
            <TouchableOpacity
              style={[styles.searchButton, { borderColor: theme.colors.outline }]}
              onPress={() => setSearchOpen(prev => !prev)}
            >
              <Icon name="Search" size={18} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          {searchOpen && (
            <SearchBar
              platform="android"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              lightTheme
              containerStyle={styles.rneSearchContainer}
              inputContainerStyle={styles.rneSearchInputContainer}
              inputStyle={styles.rneSearchInput}
              searchIcon={{ size: 18 }}
              clearIcon={{ size: 16 }}
              onClear={() => setSearchOpen(false)}
              autoFocus
            />
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        stickyHeaderIndices={[1]}
      >
        {/* Carousel (scrolls away; sits under fixed header) */}
        <View style={[styles.content, styles.carouselWrapper]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            <Image source={require('../../assets/images/welcome-background.jpg')} style={styles.carouselImage} />
            <Image source={require('../../assets/images/thetrois-logo.jpg')} style={styles.carouselImage} />
          </ScrollView>
        </View>

        {/* Sticky 2: Categories row */}
        <View style={[styles.stickyHeader, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.content, styles.stickyInner]}>
            <View style={styles.sectionHeader}>
              <Icon name="Tags" size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Danh mục</Text>
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
          </View>
        </View>

        {/* Products content */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Icon name="CupSoda" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Sản phẩm ({filteredProducts.length})
            </Text>
          </View>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product, index) => renderProduct(product, index))}
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
  fixedHeader: {
    paddingTop: 20,
    zIndex: 20,
    elevation: 0,
  },
  fixedInner: {
    paddingBottom: 0,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
  carouselWrapper: {
    paddingTop: 8,
  },
  stickyHeader: {
    zIndex: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  greetingName: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  searchOverlay: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
  },
  rneSearchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    margin: 0,
  },
  rneSearchInputContainer: {
    backgroundColor: '#fff',
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 8,
    borderWidth: 0,
  },
  rneSearchInput: {
    fontSize: 14,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  carousel: {
    height: 140,
    borderRadius: 12,
  },
  carouselImage: {
    width: width - 32,
    height: 140,
    borderRadius: 12,
    marginRight: 12,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 10,
  },
  categoryChip: {
    borderRadius: 25,
    paddingHorizontal: 2,
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
    overflow: 'hidden',
    borderWidth: 0,
    shadowOpacity: 0,
  },
  card: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: cardWidth,
    width: '100%',
    borderRadius: 8,
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  fabAdd: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  price: { fontWeight: '700', marginBottom: 6 },
});
