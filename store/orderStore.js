import { create } from 'zustand';
import { mockOrderAPI } from '../api/mockOrders';

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const ordersData = await mockOrderAPI.getOrders();
      set({ orders: ordersData, loading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ loading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ loading: true });
    try {
      const newOrder = await mockOrderAPI.createOrder(orderData);
      const { orders } = get();
      set({ 
        orders: [newOrder, ...orders],
        loading: false 
      });
      return newOrder;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const updatedOrder = await mockOrderAPI.updateOrderStatus(orderId, status);
      const { orders } = get();
      set({
        orders: orders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      });
      return updatedOrder;
    } catch (error) {
      throw error;
    }
  },
}));