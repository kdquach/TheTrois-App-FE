import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addToCart: (product, toppings = []) => {
    const { items } = get();
    const existingItem = items.find(item => 
      item.id === product.id && 
      JSON.stringify(item.toppings) === JSON.stringify(toppings)
    );

    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === existingItem.id && 
          JSON.stringify(item.toppings) === JSON.stringify(existingItem.toppings)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        toppings: toppings
      };
      set({ items: [...items, newItem] });
    }
  },

  removeFromCart: (productId) => {
    const { items } = get();
    set({ items: items.filter(item => item.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      set({ items: items.filter(item => item.id !== productId) });
    } else {
      set({
        items: items.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      });
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const toppingsPrice = item.toppings ? 
        item.toppings.reduce((sum, topping) => sum + topping.price, 0) : 0;
      return total + (item.price + toppingsPrice) * item.quantity;
    }, 0);
  },
}));