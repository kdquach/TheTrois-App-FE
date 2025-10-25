# 📖 Hướng dẫn sử dụng Loading Context

## 🚀 Cài đặt

### Bước 1: Wrap app với LoadingProvider

Mở file `app/_layout.js` và wrap toàn bộ app:

```javascript
import { LoadingProvider } from '../contexts/LoadingContext';

export default function RootLayout() {
  return (
    <PaperProvider theme={currentTheme}>
      <LoadingProvider>
        {' '}
        {/* Thêm provider này */}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          {/* ... các screen khác */}
        </Stack>
        <Toast />
      </LoadingProvider>
    </PaperProvider>
  );
}
```

---

## 💡 Cách sử dụng

### 1️⃣ **Sử dụng cơ bản - Show/Hide Loading**

```javascript
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    // Hiển thị loading
    showLoading('Đang xử lý...');

    try {
      await someAsyncTask();
      // Ẩn loading
      hideLoading();
    } catch (error) {
      hideLoading();
    }
  };

  return <Button onPress={handleSubmit}>Submit</Button>;
}
```

### 2️⃣ **Sử dụng với withLoading (Tự động ẩn)**

```javascript
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { withLoading } = useLoading();

  const fetchData = async () => {
    // Tự động show loading và hide khi xong
    const data = await withLoading(
      fetch('/api/data').then((r) => r.json()),
      'Đang tải dữ liệu...'
    );

    console.log(data);
  };

  return <Button onPress={fetchData}>Fetch Data</Button>;
}
```

### 3️⃣ **Thay đổi kiểu loading**

```javascript
const { showLoading } = useLoading();

// Lotus loading (mặc định)
showLoading('Loading...', 'lotus');

// Dots loading
showLoading('Please wait...', 'dots');

// Pulse loading
showLoading('Processing...', 'pulse');

// Spinner loading
showLoading('Loading...', 'spinner');
```

### 4️⃣ **Sử dụng trong Login/Register**

```javascript
// app/auth/login.js
import { useLoading } from '../../contexts/LoadingContext';

export default function LoginScreen() {
  const { withLoading } = useLoading();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      await withLoading(login(email, password), 'Đang đăng nhập...');

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

  return <Button onPress={handleLogin}>LOGIN</Button>;
}
```

### 5️⃣ **Sử dụng trong API calls**

```javascript
// store/productStore.js
import { create } from 'zustand';

export const useProductStore = create((set) => ({
  products: [],

  fetchProducts: async (showLoading, hideLoading) => {
    showLoading('Đang tải sản phẩm...');

    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      set({ products: data });
    } finally {
      hideLoading();
    }
  },
}));

// Trong component:
const { showLoading, hideLoading } = useLoading();
const { fetchProducts } = useProductStore();

useEffect(() => {
  fetchProducts(showLoading, hideLoading);
}, []);
```

### 6️⃣ **Multiple API calls cùng lúc**

```javascript
const { withLoading } = useLoading();

const loadAllData = async () => {
  await withLoading(
    Promise.all([fetchProducts(), fetchCategories(), fetchOrders()]),
    'Đang tải dữ liệu...'
  );
};
```

### 7️⃣ **Custom Loading Indicator**

```javascript
// Trong app/_layout.js
import CustomLoader from '../components/CustomLoader';

<LoadingProvider indicator={<CustomLoader />}>
  <App />
</LoadingProvider>;
```

---

## 🎨 API Reference

### `useLoading()` Hook

Trả về object với các methods:

| Method        | Parameters              | Description                       |
| ------------- | ----------------------- | --------------------------------- |
| `showLoading` | `(text, type)`          | Hiển thị loading với text và type |
| `hideLoading` | -                       | Ẩn loading                        |
| `withLoading` | `(promise, text, type)` | Wrap promise với loading state    |
| `isLoading`   | -                       | Boolean trạng thái loading        |
| `loadingText` | -                       | Text đang hiển thị                |

### Loading Types

- `'lotus'` - Hoa sen xoay (mặc định)
- `'dots'` - 3 chấm nhảy
- `'pulse'` - Icon phóng to thu nhỏ
- `'spinner'` - Vòng tròn xoay

---

## 🔥 Best Practices

### ✅ DO

```javascript
// ✅ Sử dụng withLoading cho async operations
await withLoading(fetchData(), 'Loading...');

// ✅ Luôn handle errors
try {
  await withLoading(apiCall(), 'Processing...');
} catch (error) {
  handleError(error);
}

// ✅ Sử dụng text mô tả rõ ràng
showLoading('Đang đăng nhập...');
showLoading('Đang tải sản phẩm...');
```

### ❌ DON'T

```javascript
// ❌ Quên hide loading
showLoading('Loading...');
await fetchData();
// Forgot hideLoading()!

// ❌ Text không rõ ràng
showLoading('Loading...');

// ❌ Nested loading
showLoading('Loading 1');
showLoading('Loading 2'); // Sẽ override loading 1
```

---

## 🆚 So sánh với @agney/react-loading

| Feature          | @agney/react-loading (Web) | LoadingContext (React Native)    |
| ---------------- | -------------------------- | -------------------------------- |
| Platform         | Web only                   | React Native                     |
| Provider         | ✅                         | ✅                               |
| Hook             | ✅                         | ✅                               |
| Auto-hide        | ❌                         | ✅ (withLoading)                 |
| Custom indicator | ✅                         | ✅                               |
| Global overlay   | ❌                         | ✅                               |
| Multiple types   | ❌                         | ✅ (lotus, dots, pulse, spinner) |

---

## 📝 Examples

### Example 1: Form Submit

```javascript
function ContactForm() {
  const { withLoading } = useLoading();

  const handleSubmit = async (data) => {
    await withLoading(submitForm(data), 'Đang gửi...');

    Alert.alert('Thành công', 'Đã gửi form!');
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### Example 2: Refresh Data

```javascript
function ProductList() {
  const { withLoading } = useLoading();

  const onRefresh = () => {
    withLoading(fetchProducts(), 'Đang làm mới...');
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    />
  );
}
```

### Example 3: Delete with Confirmation

```javascript
function DeleteButton({ itemId }) {
  const { withLoading } = useLoading();

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          withLoading(deleteItem(itemId), 'Đang xóa...');
        },
      },
    ]);
  };

  return <Button onPress={handleDelete}>Delete</Button>;
}
```

---

## 🐛 Troubleshooting

### Loading không hiển thị?

1. Check đã wrap với `LoadingProvider` chưa
2. Check console có error không
3. Verify `hideLoading()` được gọi đúng chỗ

### Loading không tự ẩn?

- Sử dụng `withLoading()` thay vì `showLoading()`
- Hoặc đảm bảo gọi `hideLoading()` trong `finally` block

### Multiple loading cùng lúc?

- LoadingContext chỉ show 1 loading tại 1 thời điểm
- Loading mới sẽ override loading cũ
- Cân nhắc dùng local loading state cho từng component
