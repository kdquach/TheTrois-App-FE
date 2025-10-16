import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen() {
  const { token, checkAuthState } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuthState();
      
      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/auth/login');
        }
      }, 2000);
    };

    initializeApp();
  }, [token, checkAuthState]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        🧋 Bubble Tea Shop
      </Text>
      <ActivityIndicator size="large" style={styles.loading} />
      <Text variant="bodyMedium">Đang khởi tạo ứng dụng...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loading: {
    marginVertical: 20,
  },
});