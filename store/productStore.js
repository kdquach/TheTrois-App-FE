import { create } from 'zustand';
import * as productApi from '../api/productApi';

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const [productsData, categoriesData] = await Promise.all([
        productApi.getProducts({ params: { page: 1, limit: 100 } }),
        productApi.getCategories(),
      ]);

      set({
        products: productsData.results || [],
        categories: categoriesData.results || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ loading: false });
    }
  },

  getProductById: (id) => {
    const { products } = get();
    return products.find((product) => product.id === id);
  },
}));
