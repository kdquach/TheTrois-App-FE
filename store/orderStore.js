import { create } from 'zustand';
import { mockOrderAPI } from '../api/mockOrders';
import { createOrder, getOrders, updateOrderStatus, getOrderLogs } from '../api/orderApi';
import { getOrderData, setOrderData } from '../utils/order';

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  orderLogs: {}, // orderId -> [{newStatus, changedAt, ...}]

  fetchOrders: async (status = "pending") => {
    set({ loading: true });
    try {
      const statuses = Array.isArray(status) ? status : [status];
      const cacheKey = `orders_${statuses.join('_')}`;
      const cachedOrders = await getOrderData(cacheKey);
      if (cachedOrders) {
        set({ orders: cachedOrders, loading: false });
      }

      // Fetch sequentially to respect API; could be parallel if backend load allows
      const all = [];
      for (const s of statuses) {
        const data = await getOrders(s);
        if (Array.isArray(data)) all.push(...data);
        else if (data?.data) all.push(...data.data);
      }
      setOrderData(cacheKey, all);
      set({ orders: all, loading: false });

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

  fetchOrderLogs: async (orderId) => {
    try {
      const res = await getOrderLogs(orderId);
      const list = Array.isArray(res) ? res : (res?.data || res?.results || []);
      set((state) => ({ orderLogs: { ...state.orderLogs, [orderId]: list } }));
      return list;
    } catch (e) {
      return [];
    }
  },
}));