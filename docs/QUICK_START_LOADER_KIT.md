# 🚀 QUICK START - react-native-loader-kit

## TL;DR - 3 Bước nhanh

### 1️⃣ Cài đặt

```bash
npm install react-native-loader-kit
```

### 2️⃣ Uncomment code trong `components/LoadingIndicator.js`

**Line 18-30:** Uncomment imports

```javascript
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

**Line 54-75:** Uncomment switch case

```javascript
switch (type) {
  case 'pulse':
    return <Pulse size={loaderSize} color={defaultColor} />;
  case 'bounce':
    return <ThreeBounce size={loaderSize} color={defaultColor} />;
  case 'wave':
    return <Wave size={loaderSize} color={defaultColor} />;
  // ... các case khác
}
```

**Line 80-90:** Xóa temporary code (return statement với "⏳ Loading...")

### 3️⃣ Restart

```bash
npm run dev
```

---

## 🎯 Recommended Types cho Bubble Tea Shop

```javascript
// Full screen loading
type = 'pulse'; // 🧋 Giống bong bóng

// Button loading
type = 'bounce'; // 💧 Giống trân châu

// Order processing
type = 'wave'; // 🌊 Mượt mà

// Cart update
type = 'flow'; // ☕ Như rót trà
```

---

## 📝 Cập nhật nhanh

### Home Screen

```javascript
// app/(tabs)/home.js - Line ~167
type = 'pulse'; // Thay 'bubble'
```

### Orders Screen

```javascript
// app/(tabs)/orders.js - Line ~395
type = 'wave'; // Thay 'bubble'
```

### Login/Register

```javascript
// app/auth/login.js - Line ~167
// app/auth/register.js - Line ~200
type = 'bounce'; // Thay 'dots'
```

### LoadingContext

```javascript
// contexts/LoadingContext.js
// Line 45, 47, 64
'pulse'; // Thay 'bubble'
```

---

## ✅ Done!

Test app:

- ✅ Home screen loading
- ✅ Orders screen loading
- ✅ Login button loading
- ✅ Register button loading
- ✅ Global loading overlay

---

## 🐛 Issue?

```bash
# Clear và restart
rm -rf node_modules .expo
npm install
npm run dev
```

📖 Chi tiết: `docs/LOADING_KIT_INSTALLATION.md`
