// Mock Orders API
const MOCK_ORDERS = [
  {
    id: 'ORD001',
    items: [
      { id: 1, name: 'Trà Sữa Truyền Thống', price: 25000, quantity: 2 },
      { id: 2, name: 'Trà Sữa Đào', price: 30000, quantity: 1 }
    ],
    totalAmount: 80000,
    status: 'completed',
    paymentMethod: 'Tiền mặt',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'ORD002',
    items: [
      { id: 3, name: 'Trà Sữa Matcha', price: 35000, quantity: 1 }
    ],
    totalAmount: 35000,
    status: 'preparing',
    paymentMethod: 'MoMo',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'ORD003',
    items: [
      { id: 4, name: 'Trà Sữa Chocolate', price: 32000, quantity: 1 },
      { id: 5, name: 'Trà Sữa Dâu', price: 30000, quantity: 1 }
    ],
    totalAmount: 62000,
    status: 'pending',
    paymentMethod: 'Tiền mặt',
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1800000)
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockOrderAPI = {
  getOrders: async () => {
    await delay(1000);
    return MOCK_ORDERS.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getOrderById: async (id) => {
    await delay(500);
    return MOCK_ORDERS.find(order => order.id === id);
  },

  createOrder: async (orderData) => {
    await delay(1500);

    const newOrder = {
      id: `ORD${String(MOCK_ORDERS.length + 1).padStart(3, '0')}`,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    MOCK_ORDERS.push(newOrder);
    return newOrder;
  },

  updateOrderStatus: async (orderId, status) => {
    await delay(500);

    const orderIndex = MOCK_ORDERS.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Đơn hàng không tồn tại');
    }

    MOCK_ORDERS[orderIndex] = {
      ...MOCK_ORDERS[orderIndex],
      status,
      updatedAt: new Date()
    };

    return MOCK_ORDERS[orderIndex];
  }
};