// Mock Authentication API
const MOCK_USERS = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@bubbletea.com',
    phone: '0123456789',
    password: '123456'
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthAPI = {
  login: async (email, password) => {
    await delay(1000); // Simulate network delay

    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const token = `mock_token_${Date.now()}`;
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  },

  register: async (userData) => {
    await delay(1000);

    // Check if email already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }

    const newUser = {
      id: MOCK_USERS.length + 1,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password
    };

    MOCK_USERS.push(newUser);

    const token = `mock_token_${Date.now()}`;
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token
    };
  },

  updateProfile: async (userData) => {
    await delay(500);

    const userIndex = MOCK_USERS.findIndex(u => u.id === 1); // Assuming current user ID is 1
    if (userIndex === -1) {
      throw new Error('Người dùng không tồn tại');
    }

    MOCK_USERS[userIndex] = {
      ...MOCK_USERS[userIndex],
      ...userData
    };

    const { password: _, ...userWithoutPassword } = MOCK_USERS[userIndex];

    return {
      user: userWithoutPassword
    };
  }
};