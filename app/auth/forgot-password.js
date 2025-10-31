import { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { TextInput, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';
import * as authApi from '../../api/authApi';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email' });
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      Toast.show({ type: 'success', text1: 'Đã gửi OTP' });
      // navigate to verify-otp with flow reset
      router.push({
        pathname: '/auth/verify-otp',
        params: { flow: 'reset', email },
      });
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || 'Gửi OTP thất bại';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/welcome-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Quên mật khẩu
          </Text>

          <Text variant="bodySmall" style={styles.label}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            mode="flat"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            cursorColor="#FFFFFF"
            textColor="#FFFFFF"
          />

          <TouchableOpacity
            onPress={handleRequestOtp}
            disabled={loading}
            style={{ marginTop: 18 }}
          >
            <Surface style={styles.submitButton} elevation={3}>
              {loading ? (
                <LoadingIndicator type="wave" size={22} color="#2F4F4F" />
              ) : (
                <Text variant="titleMedium" style={styles.submitText}>
                  Gửi mã OTP
                </Text>
              )}
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={{ marginTop: 12, alignSelf: 'center' }}
          >
            <Text variant="bodyMedium" style={styles.linkText}>
              Quay lại đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 24 },
  title: { textAlign: 'center', color: '#FFFFFF', marginBottom: 18 },
  label: { color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#8BA99E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#2F4F4F', fontWeight: 'bold' },
  linkText: { color: '#FFFFFF' },
});
