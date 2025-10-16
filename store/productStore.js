import { create } from 'zustand';
import { mockProductAPI } from '../api/mockProducts';

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const [productsData, categoriesData] = await Promise.all([
        mockProductAPI.getProducts(),
        mockProductAPI.getCategories()
      ]);
      
      set({ 
        products: productsData, 
        categories: categoriesData,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ loading: false });
    }
  },

  getProductById: (id) => {
    const { products } = get();
    return products.find(product => product.id === id);
  },
}));