import React, { createContext, useContext, useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Portal } from 'react-native-paper';
import LoadingIndicator from '../components/LoadingIndicator';

/**
 * Loading Context - Quản lý trạng thái loading toàn app
 *
 * Cách sử dụng:
 *
 * 1. Wrap app với LoadingProvider trong _layout.js:
 *    <LoadingProvider>
 *      <App />
 *    </LoadingProvider>
 *
 * 2. Sử dụng trong component:
 *    const { showLoading, hideLoading } = useLoading();
 *
 *    const handleSubmit = async () => {
 *      showLoading('Đang xử lý...');
 *      await someAsyncTask();
 *      hideLoading();
 *    };
 *
 * 3. Hoặc dùng với Promise:
 *    const { withLoading } = useLoading();
 *
 *    const data = await withLoading(
 *      fetchData(),
 *      'Đang tải dữ liệu...'
 *    );
 */

const LoadingContext = createContext({
  isLoading: false,
  loadingText: '',
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async () => {},
});

export function LoadingProvider({ children, indicator }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingType, setLoadingType] = useState('pulse');

  const showLoading = (text = 'Loading...', type = 'pulse') => {
    setLoadingText(text);
    setLoadingType(type);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingText('');
  };

  /**
   * Wrap async function với loading state
   * @param {Promise} promise - Promise cần wrap
   * @param {string} text - Text hiển thị khi loading
   * @returns {Promise} - Kết quả của promise
   */
  const withLoading = async (promise, text = 'Loading...', type = 'pulse') => {
    showLoading(text, type);
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  };

  const value = {
    isLoading,
    loadingText,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}

      {/* Global Loading Overlay */}
      {isLoading && (
        <Portal>
          <View style={styles.overlay}>
            <View style={styles.container}>
              {indicator || (
                <LoadingIndicator
                  type={loadingType}
                  size={60}
                  color="#8BA99E"
                  text={loadingText}
                />
              )}
            </View>
          </View>
        </Portal>
      )}
    </LoadingContext.Provider>
  );
}

/**
 * Hook để sử dụng Loading Context
 * @returns {Object} - Loading context value
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

/**
 * HOC để wrap component với loading state
 * @param {Component} Component - Component cần wrap
 * @returns {Component} - Wrapped component
 */
export function withLoadingHOC(Component) {
  return function WithLoadingComponent(props) {
    const loading = useLoading();
    return <Component {...props} loading={loading} />;
  };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
});
