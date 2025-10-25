// ========================================
// VÍ DỤ: Cách sử dụng LoadingContext trong Login
// ========================================

// BEFORE (Cách cũ với local loading state):
// ==========================================

import { useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';

export default function LoginScreenOld() {
  const [loading, setLoading] = useState(false); // ❌ Local state
  const { login } = useAuthStore();

  const handleLogin = async () => {
    setLoading(true); // ❌ Manual show
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Toast.show({ type: 'error', text1: error.message });
    } finally {
      setLoading(false); // ❌ Manual hide
    }
  };

  return (
    <Button disabled={loading}>
      {loading ? <ActivityIndicator /> : 'LOGIN'}
    </Button>
  );
}

// AFTER (Cách mới với LoadingContext):
// =====================================

import { useLoading } from '../../contexts/LoadingContext';

export default function LoginScreenNew() {
  const { withLoading } = useLoading(); // ✅ Use context
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      // ✅ Tự động show/hide loading với full-screen overlay
      await withLoading(
        login(email, password),
        'Đang đăng nhập...',
        'lotus' // Optional: loading type
      );
      
      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công!',
      });
      
      router.replace('/(tabs)/home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  return (
    <Button onPress={handleLogin}>
      LOGIN
    </Button>
  );
}

// ========================================
// VÍ DỤ 2: Multiple operations
// ========================================

export default function DashboardScreen() {
  const { withLoading } = useLoading();
  
  useEffect(() => {
    loadInitialData();
  }, []);
  
  const loadInitialData = async () => {
    await withLoading(
      Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchProfile(),
      ]),
      'Đang tải dữ liệu...'
    );
  };
  
  const handleRefresh = async () => {
    await withLoading(
      fetchProducts(),
      'Đang làm mới...',
      'dots' // Different loading type
    );
  };
}

// ========================================
// VÍ DỤ 3: Manual control
// ========================================

export default function ComplexFormScreen() {
  const { showLoading, hideLoading } = useLoading();
  
  const handleSubmit = async (formData) => {
    // Step 1: Validate
    showLoading('Đang kiểm tra dữ liệu...', 'dots');
    await validateForm(formData);
    
    // Step 2: Upload images
    showLoading('Đang tải ảnh lên...', 'pulse');
    const imageUrls = await uploadImages(formData.images);
    
    // Step 3: Submit
    showLoading('Đang gửi dữ liệu...', 'lotus');
    await submitForm({ ...formData, imageUrls });
    
    hideLoading();
    
    Toast.show({
      type: 'success',
      text1: 'Gửi thành công!',
    });
  };
}

// ========================================
// VÍ DỤ 4: Conditional loading
// ========================================

export default function ProductScreen() {
  const { withLoading } = useLoading();
  
  const handleAddToCart = async (product) => {
    if (product.requiresConfirmation) {
      // No loading for confirmation
      Alert.alert(
        'Xác nhận',
        'Thêm vào giỏ hàng?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Thêm',
            onPress: () => {
              // Show loading only when confirmed
              withLoading(
                addToCart(product),
                'Đang thêm vào giỏ...'
              );
            }
          }
        ]
      );
    } else {
      // Direct loading
      await withLoading(
        addToCart(product),
        'Đang thêm vào giỏ...'
      );
    }
  };
}

// ========================================
// VÍ DỤ 5: Error handling
// ========================================

export default function CheckoutScreen() {
  const { withLoading } = useLoading();
  
  const handleCheckout = async () => {
    try {
      const order = await withLoading(
        createOrder(cartItems),
        'Đang xử lý đơn hàng...'
      );
      
      // Navigate to success
      router.push(`/order/${order.id}`);
      
    } catch (error) {
      // Loading tự động ẩn khi có error
      
      if (error.code === 'INSUFFICIENT_STOCK') {
        Alert.alert(
          'Lỗi',
          'Sản phẩm đã hết hàng',
          [{ text: 'OK', onPress: () => refreshCart() }]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: error.message,
        });
      }
    }
  };
}
