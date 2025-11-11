import { create } from 'zustand';
import cartApi from '../api/cartApi';
import Toast from 'react-native-toast-message';

export const useCartStore = create((set, get) => ({
  cart: { items: [], totalPrice: 0 },
  loading: false,

  // Chuẩn hóa dữ liệu từ API
  _normalizeCartResponse: (resp) => {
    if (!resp) return { items: [], totalPrice: 0 };
    const data = resp.data || resp.cart || resp.results || resp;

    const items = Array.isArray(data.items) ? data.items : [];
    const totalPrice = data.totalPrice ?? 0;

    const normalizedItems = items.map((it) => {
      const product = it.productId || {};

      const toppingList = Array.isArray(it.toppings)
        ? it.toppings.map((t) => {
            // FIX: Lưu cả toppingId (chỉ ID) và topping object đầy đủ
            const toppingId = t.toppingId?._id || t.toppingId;
            const toppingObj = t.toppingId || t;

            return {
              id: toppingId, // Chỉ lưu ID
              _id: toppingId, // Thêm _id để backup
              toppingId: toppingId, // QUAN TRỌNG: Đảm bảo toppingId là string ID
              name: toppingObj?.name || t.name,
              price: toppingObj?.price || t.price || 0,
              quantity: t.quantity || 1,
              // Giữ nguyên object đầy đủ nếu cần
              fullTopping: toppingObj,
            };
          })
        : [];

      return {
        id: it._id || it.id,
        productId: product._id || product.id,
        name: product.name || 'Sản phẩm',
        image: product.image || null,
        unitPrice: product.price || 0,
        finalPrice: it.finalPrice ?? product.price ?? 0,
        quantity: it.quantity || 1,
        customization: it.customization || {
          size: 'S',
          ice: 100,
          sugar: 100,
          description: '',
        },
        toppings: toppingList,
        productToppings:
          product.toppings?.map((tp) => ({ id: tp._id, name: tp.name })) || [],
        note: it.note || '',
      };
    });

    return { ...data, items: normalizedItems, totalPrice };
  },

  // Lấy giỏ hàng
  fetchCart: async () => {
    try {
      set({ loading: true });
      const data = await cartApi.getCart();
      const normalized = get()._normalizeCartResponse(data);
      set({ cart: normalized });
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error.response?.data || error);
      Toast.show({ type: 'error', text1: 'Không thể tải giỏ hàng' });
    } finally {
      set({ loading: false });
    }
  },

  // Tính tổng của từng item theo công thức BE
  getItemTotalPrice: (item) => {
    console.log("🚀 ~ item:", item)
    const quantity = item.quantity || 1;
    let total = (item.unitPrice || 0) * quantity;

    const size = item.customization?.size || 'S';
    if (size === 'M') total += 5000 * quantity;
    else if (size === 'L') total += 10000 * quantity;

    if (Array.isArray(item.toppings)) {
      for (const t of item.toppings) {
        const toppingQty = t.quantity || 1;
        total += (t.price || 0) * toppingQty;
      }
    }

    return total;
  },

  // Tính tổng toàn giỏ: ưu tiên totalPrice từ BE, nếu không có thì tự tính
  getTotalPriceFE: () => {
    if (get().cart?.totalPrice) return get().cart.totalPrice;

    const items = get().cart?.items || [];
    return items.reduce((sum, item) => sum + get().getItemTotalPrice(item), 0);
  },

  // Các hàm thêm/cập nhật/xóa/clear vẫn giữ nguyên
  addToCart: async (item) => {
    try {
      set({ loading: true });
      const payload = {
        productId: item.productId,
        quantity: item.quantity || 1,
        customization: item.customization || {},
        toppings: item.toppings || [],
        note: item.note || '',
      };
      await cartApi.addToCart(payload);
      await get().fetchCart();
      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng' });
    } catch (error) {
      console.error('Lỗi thêm giỏ hàng:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Không thể thêm vào giỏ hàng',
      });
    } finally {
      set({ loading: false });
    }
  },

  updateCartItem: async (itemId, updateData) => {
    try {
      set({ loading: true });
      const payload = {};
      if (updateData.quantity !== undefined)
        payload.quantity = updateData.quantity;
      if (updateData.customization)
        payload.customization = updateData.customization;
      if (updateData.toppings) payload.toppings = updateData.toppings;
      if (updateData.note !== undefined) payload.note = updateData.note;

      await cartApi.updateCartItem(itemId, payload);
      await get().fetchCart();
      Toast.show({ type: 'success', text1: 'Đã cập nhật giỏ hàng' });
    } catch (error) {
      console.error('Lỗi cập nhật giỏ hàng:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Không thể cập nhật giỏ hàng',
      });
    } finally {
      set({ loading: false });
    }
  },

  removeCartItem: async (itemId) => {
    try {
      set({ loading: true });
      await cartApi.removeCartItem(itemId);
      await get().fetchCart();
      Toast.show({ type: 'success', text1: 'Đã xóa khỏi giỏ hàng' });
    } catch (error) {
      console.error('Lỗi xóa item:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Không thể xóa sản phẩm',
      });
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    try {
      set({ loading: true });
      await cartApi.clearCart();
      set({ cart: { items: [], totalPrice: 0 } });
      Toast.show({ type: 'success', text1: 'Đã xóa toàn bộ giỏ hàng' });
    } catch (error) {
      console.error('Lỗi xóa giỏ hàng:', error.response?.data || error);
    } finally {
      set({ loading: false });
    }
  },
}));
