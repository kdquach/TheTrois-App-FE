import { create } from 'zustand';
import { mockOrderAPI } from '../api/mockOrders';
import { createOrder, getOrders, updateOrderStatus } from '../api/orderApi';
import { getOrderData, setOrderData } from '../utils/order';

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,

  fetchOrders: async (status = "pending") => {
    set({ loading: true });
    try {
      const cacheKey = `orders_${status}`;
      const cachedOrders = await getOrderData(cacheKey);
      if (cachedOrders) {
        set({ orders: cachedOrders, loading: false });
      }
      const ordersData = await getOrders(status);
      setOrderData(cacheKey, ordersData);
      set({ orders: ordersData, loading: false });

    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ loading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ loading: true });
    try {
      const newOrder = await createOrder(orderData);
      set({ loading: false });
      return newOrder;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ loading: true });
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      const { orders } = get();
      set({
        orders: orders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      });
      set({ loading: false });
      return updatedOrder;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));