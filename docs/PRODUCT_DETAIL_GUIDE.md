# 📱 Hướng Dẫn Xem Chi Tiết Sản Phẩm

## 🎯 Cách xem chi tiết sản phẩm:

### Bước 1: Mở ứng dụng

```
Mở app → Tab "Home" (🏠)
```

### Bước 2: Nhấn vào sản phẩm

```
┌─────────────────────────────────────┐
│  🏠 Home                            │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌─────────────┐ │
│  │   [Hình]    │  │   [Hình]    │ │
│  │             │  │             │ │
│  │ Trà Sữa 🧋 │  │ Cà Phê ☕  │ │
│  │ 45,000đ     │  │ 35,000đ     │ │
│  └─────────────┘  └─────────────┘ │
│         ↑              ↑           │
│    NHẤN VÀO ĐÂY                   │
│                                     │
│  ┌─────────────┐  ┌─────────────┐ │
│  │   [Hình]    │  │   [Hình]    │ │
│  │ Matcha 🍵  │  │ Smoothie 🥤│ │
│  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
```

### Bước 3: Màn hình chi tiết sẽ mở

```
┌─────────────────────────────────────┐
│ ← Back          Chi Tiết       ♡   │
├─────────────────────────────────────┤
│                                     │
│        [Hình Sản Phẩm Lớn]         │
│                                     │
│  Trà Sữa Trân Châu Đường Đen       │
│  ⭐ 4.8 (120+ đánh giá)            │
├─────────────────────────────────────┤
│  📝 Mô tả                          │
│  Được pha chế từ...                │
├─────────────────────────────────────┤
│  ☕ Chọn size                      │
│  [ S ]  [ M ✓]  [ L ]              │
├─────────────────────────────────────┤
│  ❄️ Lượng đá                       │
│  ○ Không đá                        │
│  ● Vừa (50%)                       │
├─────────────────────────────────────┤
│  🍯 Lượng đường                    │
│  ○ Không đường                     │
│  ● Vừa (50%)                       │
├─────────────────────────────────────┤
│  🍡 Thêm topping                   │
│  [✓] 🧋 Trân châu +10K             │
│  [ ] 🍮 Thạch +8K                  │
├─────────────────────────────────────┤
│  Số lượng:    [ - ]  1  [ + ]      │
│                                     │
│  Tổng: 55,000đ  [🛒 Thêm vào giỏ] │
└─────────────────────────────────────┘
```

## 🖱️ Vị trí có thể nhấn:

### ✅ Trên màn hình Home:

#### 1. **Nhấn vào TOÀN BỘ card sản phẩm**

```javascript
// Bất kỳ phần nào của card:
- Hình ảnh sản phẩm
- Tên sản phẩm
- Mô tả sản phẩm
- Giá tiền
- Icon rating
```

#### ❌ NGOẠI TRỪ nút "Thêm vào giỏ":

```javascript
// Nút này sẽ thêm vào giỏ NHANH (không mở chi tiết):
<Button icon="plus-circle">Thêm vào giỏ</Button>
```

## 📋 Code hoạt động:

### File: `app/(tabs)/home.js`

```javascript
const renderProduct = (product, index) => (
  <Surface key={product.id} style={styles.productCard}>
    {/* Nhấn vào TouchableOpacity này để xem chi tiết */}
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/product/${product.id}`)} // ← Navigation
    >
      <View style={styles.card}>
        {/* Hình ảnh */}
        <Card.Cover source={{ uri: product.image }} />

        {/* Tên sản phẩm */}
        <Text>{product.name}</Text>

        {/* Giá */}
        <Text>{formatCurrency(product.price)}</Text>
      </View>
    </TouchableOpacity>

    {/* Nút "Thêm vào giỏ" - KHÔNG mở chi tiết */}
    <Button
      onPress={(e) => {
        e.stopPropagation(); // ← Ngăn mở chi tiết
        handleAddToCart(product);
      }}
    >
      Thêm vào giỏ
    </Button>
  </Surface>
);
```

## 🎯 Tóm tắt:

| Hành động                   | Kết quả                           |
| --------------------------- | --------------------------------- |
| **Nhấn vào card sản phẩm**  | ✅ Mở màn hình chi tiết           |
| **Nhấn vào hình ảnh**       | ✅ Mở màn hình chi tiết           |
| **Nhấn vào tên sản phẩm**   | ✅ Mở màn hình chi tiết           |
| **Nhấn vào giá**            | ✅ Mở màn hình chi tiết           |
| **Nhấn nút "Thêm vào giỏ"** | ❌ Thêm nhanh (không mở chi tiết) |

## 🧪 Test ngay:

### Bước 1: Mở app

```bash
npm run dev
# hoặc
expo start
```

### Bước 2: Scan QR code bằng Expo Go

### Bước 3: Thử nhấn vào sản phẩm

- Nhấn vào **bất kỳ sản phẩm nào** trên Home screen
- Màn hình chi tiết sẽ mở với đầy đủ tùy chọn

## 💡 Tips:

### Xem tất cả sản phẩm:

- Scroll xuống ở Home screen
- Xem theo danh mục: "Tất cả", "Trà sữa", "Cà phê", "Smoothie"

### Tìm kiếm sản phẩm:

- Dùng thanh tìm kiếm ở trên cùng
- Gõ tên sản phẩm
- Kết quả tự động lọc

### Refresh danh sách:

- Kéo xuống (pull-to-refresh) để tải lại sản phẩm

## 🎨 Visual Guide:

```
HOME SCREEN
═══════════════════════════════════════

    🔍 Tìm kiếm sản phẩm...

    [Tất cả] [Trà sữa] [Cà phê]

    ┌──────────┐  ┌──────────┐
    │  [IMG]   │  │  [IMG]   │
    │  Trà Sữa │  │  Cà Phê  │ ← Nhấn vào đây
    │  45K ⭐  │  │  35K ⭐  │
    │ [+ Thêm] │  │ [+ Thêm] │ ← HOẶC nhấn để thêm nhanh
    └──────────┘  └──────────┘
         ↓
         ↓ (Nhấn vào card)
         ↓

PRODUCT DETAIL SCREEN
═══════════════════════════════════════

    ← Back              ♡

    ┌─────────────────────┐
    │                     │
    │   [Product Image]   │
    │                     │
    └─────────────────────┘

    Trà Sữa Trân Châu
    ⭐ 4.8 (120+)

    ☕ Size: [S] [M✓] [L]
    ❄️  Đá: 50%
    🍯 Đường: 50%
    🍡 Topping: Trân châu ✓

    Số lượng: [-] 1 [+]

    Tổng: 55,000đ  [🛒 Thêm vào giỏ]
```

## ✅ Checklist hoàn thành:

- [x] ✅ TouchableOpacity wrapping product card
- [x] ✅ Navigation: `router.push(\`/product/${product.id}\`)`
- [x] ✅ Product detail screen đã được tạo
- [x] ✅ Dynamic route: `app/product/[id].js`
- [x] ✅ Loading state khi product không tồn tại
- [x] ✅ Full customization options (size, ice, sugar, toppings)
- [x] ✅ Add to cart functionality
- [x] ✅ Back navigation

**App đã sẵn sàng! Nhấn vào bất kỳ sản phẩm nào để xem chi tiết! 🚀**
