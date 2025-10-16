// Mock Products API
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Trà Sữa Truyền Thống',
    description: 'Trà sữa đậm đà với hương vị truyền thống',
    price: 25000,
    image: 'https://images.pexels.com/photos/2693447/pexels-photo-2693447.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'classic'
  },
  {
    id: 2,
    name: 'Trà Sữa Đào',
    description: 'Trà sữa thơm ngon với vị đào tươi mát',
    price: 30000,
    image: 'https://images.pexels.com/photos/5946962/pexels-photo-5946962.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'fruit'
  },
  {
    id: 3,
    name: 'Trà Sữa Matcha',
    description: 'Trà sữa matcha Nhật Bản thơm ngon',
    price: 35000,
    image: 'https://images.pexels.com/photos/5946746/pexels-photo-5946746.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'premium'
  },
  {
    id: 4,
    name: 'Trà Sữa Chocolate',
    description: 'Trà sữa chocolate đậm đà, ngọt ngào',
    price: 32000,
    image: 'https://images.pexels.com/photos/5946850/pexels-photo-5946850.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'premium'
  },
  {
    id: 5,
    name: 'Trà Sữa Dâu',
    description: 'Trà sữa vị dâu tây tươi mát',
    price: 30000,
    image: 'https://images.pexels.com/photos/5946969/pexels-photo-5946969.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'fruit'
  },
  {
    id: 6,
    name: 'Trà Sữa Khoai Môn',
    description: 'Trà sữa khoai môn thơm béo',
    price: 28000,
    image: 'https://images.pexels.com/photos/5946847/pexels-photo-5946847.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'classic'
  }
];

const MOCK_CATEGORIES = [
  { id: 'classic', name: 'Truyền thống' },
  { id: 'fruit', name: 'Hoa quả' },
  { id: 'premium', name: 'Cao cấp' }
];

const MOCK_TOPPINGS = [
  { id: 1, name: 'Trân châu đen', price: 5000 },
  { id: 2, name: 'Trân châu trắng', price: 5000 },
  { id: 3, name: 'Thạch dừa', price: 7000 },
  { id: 4, name: 'Pudding', price: 8000 },
  { id: 5, name: 'Kem cheese', price: 10000 }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockProductAPI = {
  getProducts: async () => {
    await delay(800);
    return MOCK_PRODUCTS;
  },

  getCategories: async () => {
    await delay(300);
    return MOCK_CATEGORIES;
  },

  getToppings: async () => {
    await delay(300);
    return MOCK_TOPPINGS;
  },

  getProductById: async (id) => {
    await delay(500);
    return MOCK_PRODUCTS.find(product => product.id === id);
  }
};