import apiClient from './apiClient';

// Lấy danh sách địa chỉ của người dùng hiện tại
export const getMyAddresses = async () => {
  // apiClient already returns response.data via its interceptor, so return the result directly
  return apiClient.get('/addresses/my');
};

// Xóa địa chỉ theo id
export const deleteAddress = async (id) => apiClient.delete(`/addresses/${id}`);

export const getAddressById = async (id) => apiClient.get(`/addresses/${id}`);

export const createAddress = async (data) => apiClient.post('/addresses', data);

export const updateAddress = async (id, data) => apiClient.patch(`/addresses/${id}`, data);

export default {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
