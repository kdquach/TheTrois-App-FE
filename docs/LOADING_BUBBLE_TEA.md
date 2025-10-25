# 🧋 LoadingIndicator - Bubble Tea Shop Theme

## 📖 Tổng quan

Component `LoadingIndicator` được thiết kế đặc biệt cho ứng dụng **bán trà sữa** với các icon và animation phù hợp với theme Starbucks/Bubble Tea.

---

## 🎨 Các kiểu Loading có sẵn

### 1️⃣ **'bubble'** - Cốc trà sữa (Mặc định) 🧋

Icon cốc trà sữa phóng to thu nhỏ + xoay 360°

```javascript
<LoadingIndicator type="bubble" text="Đang tải sản phẩm..." />
```

**Sử dụng cho:**

- Tải danh sách sản phẩm
- Tải chi tiết sản phẩm
- Thêm vào giỏ hàng

---

### 2️⃣ **'dots'** - Ba chấm tròn (Giống bong bóng trà) 💧

3 chấm tròn nhảy lên xuống như bong bóng trong trà sữa

```javascript
<LoadingIndicator type="dots" text="Đang xử lý..." />
```

**Sử dụng cho:**

- Loading nút button (Login, Register, Submit)
- Loading nhỏ trong form
- Processing actions

---

### 3️⃣ **'starbucks'** - Cà phê Starbucks ☕

Icon cà phê xoay (phù hợp với theme Starbucks)

```javascript
<LoadingIndicator type="starbucks" text="Đang chuẩn bị..." />
```

**Sử dụng cho:**

- Đang pha chế đơn hàng
- Chuẩn bị món
- Xử lý thanh toán

---

### 4️⃣ **'tea'** - Trà 🍵

Icon trà xoay (phù hợp cho trà sữa, trà đào, trà thái)

```javascript
<LoadingIndicator type="tea" text="Đang pha trà..." />
```

**Sử dụng cho:**

- Đang pha trà
- Processing drink orders
- Refreshing menu

---

### 5️⃣ **'spinner'** - Vòng tròn xoay (Default) ⭕

ActivityIndicator mặc định của React Native

```javascript
<LoadingIndicator type="spinner" text="Loading..." />
```

**Sử dụng cho:**

- Fallback loading
- Generic loading

---

## 💻 Cách sử dụng

### Basic Usage

```javascript
import LoadingIndicator from '../components/LoadingIndicator';

function ProductScreen() {
  return (
    <LoadingIndicator
      type="bubble" // Kiểu loading
      size="large" // 'small' | 'large'
      color="#00704A" // Màu Starbucks Green
      text="Đang tải..." // Text hiển thị
    />
  );
}
```

### Trong Home Screen (Tải sản phẩm)

```javascript
// app/(tabs)/home.js
if (loading && products.length === 0) {
  return (
    <View style={styles.loadingContainer}>
      <LoadingIndicator
        type="bubble" // 🧋 Icon cốc trà sữa
        size="large"
        color={theme.colors.starbucksGreen}
        text="Đang tải sản phẩm..."
      />
    </View>
  );
}
```

### Trong Login/Register (Button Loading)

```javascript
// app/auth/login.js
<Button>
  {loading ? (
    <LoadingIndicator
      type="dots" // 💧 3 chấm nhảy (nhỏ gọn cho button)
      size="small"
      color="#2F4F4F"
    />
  ) : (
    <Text>LOGIN</Text>
  )}
</Button>
```

### Trong Orders Screen (Tải đơn hàng)

```javascript
// app/(tabs)/orders.js
if (loading && orders.length === 0) {
  return (
    <LoadingIndicator
      type="starbucks" // ☕ Icon cà phê Starbucks
      size="large"
      color={theme.colors.starbucksGreen}
      text="Đang tải đơn hàng..."
    />
  );
}
```

### Với LoadingContext (Global Loading)

```javascript
import { useLoading } from '../contexts/LoadingContext';

function CheckoutScreen() {
  const { withLoading } = useLoading();

  const handleCheckout = async () => {
    await withLoading(
      processOrder(),
      'Đang xử lý đơn hàng...',
      'starbucks' // ☕ Starbucks loading khi checkout
    );
  };
}
```

---

## 🎯 Best Practices

### ✅ DO - Khuyến nghị

```javascript
// ✅ Dùng 'bubble' cho tải sản phẩm
<LoadingIndicator type="bubble" text="Đang tải sản phẩm..." />

// ✅ Dùng 'dots' cho button loading
<LoadingIndicator type="dots" size="small" />

// ✅ Dùng 'starbucks' cho order processing
<LoadingIndicator type="starbucks" text="Đang chuẩn bị..." />

// ✅ Dùng màu Starbucks theme
<LoadingIndicator color={theme.colors.starbucksGreen} />
```

### ❌ DON'T - Tránh

```javascript
// ❌ Đừng dùng 'lotus' (hoa sen - không phù hợp với trà sữa)
<LoadingIndicator type="lotus" />

// ❌ Đừng dùng loading quá to trong button
<Button>
  <LoadingIndicator size="large" /> {/* Dùng 'small' */}
</Button>

// ❌ Đừng quên text mô tả rõ ràng
<LoadingIndicator text="Loading..." /> {/* Không rõ ràng */}
```

---

## 🎨 Theme Colors

Các màu phù hợp với Bubble Tea/Starbucks theme:

```javascript
// Starbucks Green
color="#00704A"
color={theme.colors.starbucksGreen}

// Starbucks Gold
color="#D4AF37"
color={theme.colors.starbucksGold}

// Warm Brown
color="#8B4513"
color={theme.colors.warmBrown}

// Soft Mint (cho meditation feel)
color="#8BA99E"
```

---

## 🔧 Customization

### Thay đổi icon mặc định

Mở file `components/LoadingIndicator.js`:

```javascript
// Dòng 21: Thay đổi type mặc định
export default function LoadingIndicator({
  type = 'bubble', // ⭐ THAY ĐỔI TẠI ĐÂY
  ...
})

// Dòng 30-38: Thay đổi icon cho từng type
case 'bubble':
  return <LoadingPulse color={defaultColor} icon="cup" />;
case 'starbucks':
  return <LoadingPulse color={defaultColor} icon="coffee" />;
case 'tea':
  return <LoadingPulse color={defaultColor} icon="tea" />;
```

### Thêm icon mới

```javascript
// Thêm case mới
case 'boba':
  return <LoadingPulse color={defaultColor} icon="circle-multiple" />;

// MaterialCommunityIcons có nhiều icon liên quan:
// - cup, cup-water, cup-outline
// - coffee, coffee-outline, coffee-maker
// - tea, tea-outline
// - glass-cocktail
// - bottle-soda
// - water
```

---

## 📱 Demo trong App

### Home Screen

```javascript
🧋 Bubble Tea Icon → "Đang tải sản phẩm..."
```

### Cart Screen

```javascript
🧋 Bubble Tea Icon → "Đang cập nhật giỏ hàng..."
```

### Orders Screen

```javascript
☕ Starbucks Icon → "Đang tải đơn hàng..."
```

### Checkout

```javascript
☕ Starbucks Icon → "Đang xử lý đơn hàng..."
```

### Login/Register Button

```javascript
💧 Dots → (No text, animation only)
```

---

## 🆚 So với theme cũ

| Feature    | Theme cũ (Meditation) | Theme mới (Bubble Tea) |
| ---------- | --------------------- | ---------------------- |
| Icon chính | 🪷 Lotus               | 🧋 Bubble Tea Cup      |
| Màu sắc    | Pastel green          | Starbucks Green        |
| Animation  | Gentle                | Playful                |
| Context    | Meditation/Wellness   | Coffee/Tea Shop        |
| Phù hợp    | ❌                    | ✅                     |

---

## 🚀 Quick Reference

```javascript
// Product Loading
type="bubble" + "Đang tải sản phẩm..."

// Order Processing
type="starbucks" + "Đang xử lý đơn hàng..."

// Button Loading
type="dots" + size="small" (no text)

// Cart Update
type="bubble" + "Đang cập nhật giỏ hàng..."

// Refresh
type="tea" + "Đang làm mới..."
```

---

## 💡 Tips

1. **Consistency**: Dùng cùng 1 kiểu loading cho cùng loại action
2. **Performance**: `dots` loading render nhanh nhất
3. **UX**: Luôn có text mô tả để user biết đang làm gì
4. **Theme**: Stick với Starbucks colors cho consistency
5. **Size**:
   - `large` cho full-screen loading
   - `small` cho button/inline loading

---

Bây giờ loading indicator đã phù hợp hoàn toàn với theme bán trà sữa! 🧋✨
