import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { getAccessToken, clearAuth } from '../utils/auth';

// Use environment variable (if available) otherwise fallback to Constants.expoConfig/manifest
const expoExtra =
  (Constants && Constants.expoConfig && Constants.expoConfig.extra) ||
  (Constants && Constants.manifest && Constants.manifest.extra) ||
  {};

const API_BASE_URL =
  process?.env?.VITE_API_URL ||
  expoExtra?.VITE_API_URL ||
  'http://localhost:3000/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - attach token if available
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        // Debug helper (won't run in production if console.debug is silenced)
        try {
          console.debug &&
            console.debug('[apiClient] Attaching token to request');
        } catch (e) {}
      }
    } catch (err) {
      // ignore token errors
      console.warn('apiClient request token error', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common HTTP errors and show toast in RN
apiClient.interceptors.response.use(
  (response) => response.data ?? response,
  async (error) => {
    const config = error?.config || {};

    // If caller set silentError flag, just forward the error
    if (config.silentError) return Promise.reject(error);

    const response = error?.response;

    if (response) {
      const { status, data } = response;
      switch (status) {
        case 400:
          Toast.show({
            type: 'error',
            text1: data?.message || 'Dữ liệu không hợp lệ',
          });
          break;
        case 401:
          // Unauthorized - clear auth and optionally navigate to login
          await clearAuth();
          Toast.show({
            type: 'error',
            text1: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
          });
          break;
        case 403:
          Toast.show({
            type: 'error',
            text1: data?.message || 'Bạn không có quyền thực hiện thao tác này',
          });
          break;
        case 404:
          Toast.show({
            type: 'error',
            text1: data?.message || 'Không tìm thấy tài nguyên',
          });
          break;
        case 422:
          if (data?.errors) {
            Object.values(data.errors).forEach((errs) => {
              if (Array.isArray(errs) && errs[0]) {
                Toast.show({ type: 'error', text1: errs[0] });
              }
            });
          } else {
            Toast.show({
              type: 'error',
              text1: data?.message || 'Dữ liệu không hợp lệ',
            });
          }
          break;
        case 500:
          Toast.show({
            type: 'error',
            text1: 'Lỗi hệ thống, vui lòng thử lại sau',
          });
          break;
        default:
          Toast.show({
            type: 'error',
            text1: data?.message || 'Có lỗi xảy ra',
          });
          break;
      }
    } else if (error?.code === 'ECONNABORTED') {
      Toast.show({
        type: 'error',
        text1: 'Timeout - vui lòng kiểm tra kết nối mạng',
      });
    } else {
      Toast.show({ type: 'error', text1: 'Lỗi kết nối, vui lòng thử lại' });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
