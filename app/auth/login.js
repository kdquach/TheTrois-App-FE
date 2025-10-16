import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('demo@bubbletea.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập email và mật khẩu',
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đăng nhập thành công!',
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đăng nhập thất bại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          🧋 Bubble Tea
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Chào mừng bạn trở lại!
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            >
              Đăng nhập
            </Button>

            <Button
              mode="text"
              onPress={() => router.push('/auth/register')}
              style={styles.textButton}
            >
              Chưa có tài khoản? Đăng ký ngay
            </Button>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.demoInfo}>
          Demo: demo@bubbletea.com / 123456
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: 'white',
    marginBottom: 30,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 4,
  },
  textButton: {
    marginTop: 10,
  },
  demoInfo: {
    textAlign: 'center',
    color: 'white',
    opacity: 0.8,
  },
});