import apiClient from './apiClient';

/**
 * Đăng nhập người dùng
 * @param {Object} credentials
 * @returns {Promise<{user: Object, token: string}>}
 */
export const login = async (credentials) => {
  try {
    console.log(process?.env?.VITE_API_URL);
    const data = await apiClient.post('/auth/login', credentials);
    return data;
  } catch (error) {
    console.error('Login error:', error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Xác thực token và lấy thông tin người dùng
 * @returns {Promise<Object>}
 */
export const verifyToken = async () => {
  try {
    const data = await apiClient.get('/auth/verify');
    return data;
  } catch (error) {
    console.error('verifyToken error:', error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = async () => {
  try {
    const data = await apiClient.post('/auth/logout');
    return data;
  } catch (error) {
    console.error('logout error:', error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Lấy thông tin user hiện tại
 */
export const getCurrentUser = async () => {
  try {
    const data = await apiClient.get('/auth/me');
    return data;
  } catch (error) {
    console.error(
      'getCurrentUser error:',
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Cập nhật profile
 */
export const updateProfile = async (userData) => {
  console.log("🚀 ~ updateProfile ~ userData:", userData.avatar)
  try {
    const formData = new FormData();
    for (const key in userData) {
      if ((key === 'avatar' && userData.avatar?.originFileObj)
        || (key === 'avatar' && userData.avatar)
      ) {
        const fileToUpload = userData.avatar?.originFileObj
          ? userData.avatar?.originFileObj // web
          : userData.avatar; // native
        formData.append('avatar', fileToUpload);
        continue;
      }
      if (userData[key] !== undefined && userData[key] !== null) {
        formData.append(key, userData[key]);
      }
    }
    const data = await apiClient.patch('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error(
      'updateProfile error:',
      error?.response?.data || error.message
    );
    throw error?.response?.data || error;
  }
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (passwordData) => {
  try {
    const data = await apiClient.patch('/auth/change-password', passwordData);
    return data;
  } catch (error) {
    console.error(
      'changePassword error:',
      error?.response?.data || error.message
    );
    throw error.response.data || error;
  }
};

/**
 * Yêu cầu đặt lại mật khẩu
 */
export const requestPasswordReset = async (email) => {
  try {
    const data = await apiClient.post('/auth/forgot-password/send-otp', {
      email,
    });
    return data;
  } catch (error) {
    console.error(
      'requestPasswordReset error:',
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (resetData) => {
  try {
    const data = await apiClient.post(
      '/auth/reset-password/with-otp',
      resetData
    );
    return data;
  } catch (error) {
    console.error(
      'resetPassword error:',
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Register (send OTP)
 */
export const register = async (userData) => {
  try {
    const data = await apiClient.post('/auth/register/send-otp', userData);
    return data;
  } catch (error) {
    console.error('register error:', error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify register OTP
 */
export const verifyRegisterOtp = async (verifyData) => {
  try {
    const data = await apiClient.post('/auth/register/verify-otp', verifyData);
    return data;
  } catch (error) {
    console.error(
      'verifyRegisterOtp error:',
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Verify forgot password OTP
 */
export const verifyForgotPasswordOtp = async (verifyData) => {
  try {
    const data = await apiClient.post(
      '/auth/forgot-password/verify-otp',
      verifyData
    );
    return data;
  } catch (error) {
    console.error(
      'verifyForgotPasswordOtp error:',
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Login with Google
 */
export const loginWithGoogle = async (googleData) => {
  try {
    const data = await apiClient.post('/auth/google', {
      token: googleData.token,
    });
    return data;
  } catch (error) {
    console.error(
      'loginWithGoogle error:',
      error?.response?.data || error.message
    );
    throw error;
  }
};
