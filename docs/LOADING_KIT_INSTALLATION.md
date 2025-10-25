# 🎨 Cài đặt react-native-loader-kit cho Loading Animations

## 📦 Bước 1: Cài đặt thư viện

Chọn một trong các cách sau:

### Option 1: NPM

```bash
npm install react-native-loader-kit
```

### Option 2: Yarn (Khuyến nghị)

```bash
yarn add react-native-loader-kit
```

### Option 3: Nếu gặp lỗi network

```bash
# Thử với registry khác
npm install react-native-loader-kit --registry=https://registry.npmjs.org/

# Hoặc tăng timeout
npm install react-native-loader-kit --fetch-timeout=60000
```

---

## 🔧 Bước 2: Cập nhật LoadingIndicator.js

Sau khi cài đặt xong, thực hiện các bước sau:

### 2.1. Replace file cũ

```bash
# Backup file cũ
mv components/LoadingIndicator.js components/LoadingIndicator_old.js

# Sử dụng file mới
mv components/LoadingIndicator_new.js components/LoadingIndicator.js
```

### 2.2. Uncomment import statements

Mở file `components/LoadingIndicator.js` và uncomment:

```javascript
// BEFORE (Đang comment):
// import {
//   CircleSnail,
//   Bars,
//   ...
// } from 'react-native-loader-kit';

// AFTER (Uncomment):
import {
  CircleSnail,
  Bars,
  Pulse,
  DoubleBounce,
  Wave,
  ChasingDots,
  ThreeBounce,
  Circle,
  Swing,
  Flow,
  Bounce,
} from 'react-native-loader-kit';
```

### 2.3. Uncomment renderLoading function

Tìm và uncomment phần switch case:

```javascript
// BEFORE (Đang comment):
// switch (type) {
//   case 'pulse':
//     return <Pulse size={loaderSize} color={defaultColor} />;
//   ...
// }

// AFTER (Uncomment):
switch (type) {
  case 'pulse':
    return <Pulse size={loaderSize} color={defaultColor} />;
  case 'bounce':
    return <ThreeBounce size={loaderSize} color={defaultColor} />;
  case 'wave':
    return <Wave size={loaderSize} color={defaultColor} />;
  case 'flow':
    return <Flow size={loaderSize} color={defaultColor} />;
  case 'bars':
    return <Bars size={loaderSize} color={defaultColor} />;
  case 'circle':
    return <Circle size={loaderSize} color={defaultColor} />;
  case 'snail':
    return <CircleSnail size={loaderSize} color={defaultColor} />;
  case 'dots':
    return <ChasingDots size={loaderSize} color={defaultColor} />;
  case 'swing':
    return <Swing size={loaderSize} color={defaultColor} />;
  case 'double':
    return <DoubleBounce size={loaderSize} color={defaultColor} />;
  default:
    return <Pulse size={loaderSize} color={defaultColor} />;
}
```

### 2.4. Xóa temporary code

Xóa phần code tạm thời:

```javascript
// XÓA đoạn này:
return (
  <View style={styles.tempContainer}>
    <Text style={[styles.tempText, { color: defaultColor }]}>
      ⏳ Loading...
    </Text>
    <Text style={styles.installText}>
      Đang chờ cài đặt react-native-loader-kit
    </Text>
  </View>
);
```

---

## 🎯 Bước 3: Test các loại Loading

### Các loại loading phù hợp với Bubble Tea Shop:

#### 1. **Pulse** - Vòng tròn phóng to (Giống bong bóng) 🧋

```javascript
<LoadingIndicator
  type="pulse"
  size={48}
  color={theme.colors.starbucksGreen}
  text="Đang tải sản phẩm..."
/>
```

#### 2. **Bounce** - Ba chấm nảy (Giống trân châu) 💧

```javascript
<LoadingIndicator type="bounce" size={32} color={theme.colors.starbucksGreen} />
```

#### 3. **Wave** - Sóng chuyển động (Như chất lỏng) 🌊

```javascript
<LoadingIndicator
  type="wave"
  size={48}
  color={theme.colors.starbucksGold}
  text="Đang xử lý..."
/>
```

#### 4. **Flow** - Chuyển động mượt (Như rót trà) ☕

```javascript
<LoadingIndicator
  type="flow"
  size={48}
  color={theme.colors.starbucksGreen}
  text="Đang pha chế..."
/>
```

#### 5. **Bars** - Các thanh nhảy (Level trà sữa) 📊

```javascript
<LoadingIndicator type="bars" size={40} color={theme.colors.starbucksGreen} />
```

---

## 🔄 Bước 4: Cập nhật các file đang dùng

### Home Screen

```javascript
// app/(tabs)/home.js
<LoadingIndicator
  type="pulse" // Thay 'bubble' → 'pulse'
  size={48}
  color={theme.colors.starbucksGreen}
  text="Đang tải sản phẩm..."
/>
```

### Orders Screen

```javascript
// app/(tabs)/orders.js
<LoadingIndicator
  type="wave" // Thay 'bubble' → 'wave'
  size={48}
  color={theme.colors.starbucksGreen}
  text="Đang tải đơn hàng..."
/>
```

### Login/Register Buttons

```javascript
// app/auth/login.js & register.js
<LoadingIndicator
  type="bounce" // Thay 'dots' → 'bounce'
  size={32}
  color="#2F4F4F"
/>
```

### LoadingContext

```javascript
// contexts/LoadingContext.js
// Đổi default type từ 'bubble' → 'pulse'
const [loadingType, setLoadingType] = useState('pulse');
const showLoading = (text = 'Loading...', type = 'pulse') => { ... }
const withLoading = async (promise, text, type = 'pulse') => { ... }
```

---

## 📸 Preview các loại Loading

```
┌─────────────────────────────────────────┐
│ PULSE - Vòng tròn phóng to             │
│   ⭕ → ⭕ → ⭕ → ⭕                       │
│   Giống bong bóng trà sữa              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ BOUNCE - Ba chấm nảy                    │
│   • • •  →  •• •  →  • ••              │
│   Giống trân châu trong trà            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ WAVE - Sóng chuyển động                 │
│   ～～～～～                             │
│   Như chất lỏng đang chảy              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ FLOW - Chuyển động mượt                 │
│   ◯◯◯◯◯ → ○●○○○ → ○○●○○               │
│   Như đang rót trà                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ BARS - Các thanh nhảy                   │
│   ▁▃▅▇ ▁▃▅▇                            │
│   Như level trong cốc trà sữa          │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

Đánh dấu khi hoàn thành:

- [ ] **Step 1:** Cài đặt `react-native-loader-kit`
- [ ] **Step 2:** Replace LoadingIndicator.js với file mới
- [ ] **Step 3:** Uncomment import statements
- [ ] **Step 4:** Uncomment renderLoading function
- [ ] **Step 5:** Xóa temporary code
- [ ] **Step 6:** Cập nhật Home screen (pulse)
- [ ] **Step 7:** Cập nhật Orders screen (wave)
- [ ] **Step 8:** Cập nhật Login/Register (bounce)
- [ ] **Step 9:** Cập nhật LoadingContext (pulse default)
- [ ] **Step 10:** Test tất cả screens
- [ ] **Step 11:** Restart Metro bundler

---

## 🐛 Troubleshooting

### Lỗi: Cannot find module 'react-native-loader-kit'

**Giải pháp:**

```bash
# Clear cache và reinstall
rm -rf node_modules
npm install
# hoặc
yarn install

# Restart Metro
npx expo start -c
```

### Lỗi: Network timeout

**Giải pháp:**

```bash
# Tăng timeout
npm config set fetch-timeout 600000

# Thử lại
npm install react-native-loader-kit
```

### Lỗi: Module not found after install

**Giải pháp:**

```bash
# Restart Metro bundler
# Press 'r' trong Metro terminal
# Hoặc
npx expo start -c
```

---

## 🎨 Khuyến nghị cho Bubble Tea Shop

| Screen       | Loading Type | Lý do                        |
| ------------ | ------------ | ---------------------------- |
| **Home**     | `pulse`      | Giống bong bóng trà phóng to |
| **Orders**   | `wave`       | Như chất lỏng đang chảy      |
| **Cart**     | `flow`       | Smooth như rót trà           |
| **Checkout** | `bars`       | Professional, như thanh toán |
| **Buttons**  | `bounce`     | Nhỏ gọn, giống trân châu     |
| **Refresh**  | `snail`      | Mượt mà khi làm mới          |

---

## 📚 Tài liệu tham khảo

- [react-native-loader-kit GitHub](https://github.com/maitrungduc1410/react-native-loader-kit)
- [Demo & Examples](https://github.com/maitrungduc1410/react-native-loader-kit#examples)

---

## 🚀 Next Steps

Sau khi cài đặt xong:

1. ✅ Test tất cả screens
2. ✅ Chọn loading type phù hợp nhất
3. ✅ Update documentation
4. ✅ Commit changes

```bash
git add .
git commit -m "feat: integrate react-native-loader-kit for better loading animations"
```
