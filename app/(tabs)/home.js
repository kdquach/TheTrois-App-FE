import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Appbar, 
  Card, 
  Text, 
  Button, 
  Chip, 
  ActivityIndicator,
  Searchbar 
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { formatCurrency } from '../../utils/format';
import Toast from 'react-native-toast-message';

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
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

  const renderProduct = (product) => (
    <Card key={product.id} style={styles.productCard}>
      <Card.Cover 
        source={{ uri: product.image }} 
        style={styles.productImage}
      />
      <Card.Content>
        <Text variant="titleMedium" style={styles.productName}>
          {product.name}
        </Text>
        <Text variant="bodyMedium" style={styles.productDescription}>
          {product.description}
        </Text>
        <View style={styles.productFooter}>
          <Text variant="titleLarge" style={[styles.price, { color: theme.colors.primary }]}>
            {formatCurrency(product.price)}
          </Text>
          <Button
            mode="contained"
            onPress={() => handleAddToCart(product)}
            compact
          >
            Thêm
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="🧋 Bubble Tea Shop" />
        <Appbar.Action 
          icon={isDarkMode ? 'weather-sunny' : 'weather-night'} 
          onPress={toggleTheme} 
        />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Searchbar
            placeholder="Tìm kiếm trà sữa..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <Chip
              selected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
              style={styles.categoryChip}
            >
              Tất cả
            </Chip>
            {categories.map(category => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={styles.categoryChip}
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.productsGrid}>
            {filteredProducts.map(renderProduct)}
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
  searchbar: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    marginBottom: 16,
  },
  productImage: {
    height: 200,
  },
  productName: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  productDescription: {
    marginTop: 4,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: 'bold',
  },
});