import apiClient from './apiClient';

const cartApi = {
  // Lấy giỏ hàng người dùng
  getCart: async () => {
    return apiClient.get('/cart');
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (data) => {
    return apiClient.post('/cart', data);
  },

  // Cập nhật một item trong giỏ hàng
  updateCartItem: async (itemId, data) => {
    return apiClient.patch(`/cart/${itemId}`, data);
  },

  // Xóa một item khỏi giỏ hàng
  removeCartItem: async (itemId) => {
    return apiClient.delete(`/cart/${itemId}`);
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    return apiClient.delete('/cart');
  },
};

export default cartApi;
