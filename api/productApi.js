import apiClient from './apiClient';

/**
 * Fetch list of products
 * @param {Object} [options] - Optional query options
 * @param {Object} [options.params] - Query params, e.g. { page: 1, limit: 20, category: 'classic' }
 * @param {boolean} [options.silentError] - If true, suppress toast/error UI from apiClient
 * @returns {Promise<Object[]>} - Array of products (shape depends on backend)
 */
export const getProducts = async (options = {}) => {
  const { params, silentError } = options;
  try {
    // apiClient returns response.data via interceptor
    const data = await apiClient.get('/products', { params, silentError });
    return data;
  } catch (error) {
    // caller can handle the error
    throw error;
  }
};

/**
 * Fetch product categories
 * @returns {Promise<Object[]>}
 */
export const getCategories = async (options = {}) => {
  const { silentError } = options;
  try {
    const data = await apiClient.get('/categories', { silentError });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a single product by id
 * @param {number|string} id - Product id
 * @param {Object} [options]
 * @param {boolean} [options.silentError]
 * @returns {Promise<Object>} - Product object
 */
export const getProductById = async (id, options = {}) => {
  const { silentError } = options;
  if (id === undefined || id === null) throw new Error('Missing product id');
  try {
    const data = await apiClient.get(`/products/${id}`, { silentError });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch toppings (if backend exposes it)
 * @returns {Promise<Object[]>}
 */
export const getToppings = async (options = {}) => {
  const { silentError } = options;
  try {
    const data = await apiClient.get('/toppings', { silentError });
    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  getProducts,
  getCategories,
  getProductById,
  getToppings,
};
