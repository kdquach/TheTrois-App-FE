import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { TextInput, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';
import * as authApi from '../../api/authApi';

export default function VerifyOtpScreen() {
  // useLocalSearchParams returns route params in the app router environment
  const params = useLocalSearchParams();
  const flow = params?.flow ?? 'register';
  const email = params?.email ?? '';
  const name = params?.name ?? '';
  const phone = params?.phone ?? '';
  const password = params?.password ?? '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // nothing for now, email may be prefilled from params
  }, [email]);

  const handleSubmit = async () => {
    if (!otp) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mã OTP',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { email, otp };

      if (flow === 'register') {
        // include other register fields if backend requires
        await authApi.verifyRegisterOtp({ name, phone, password, email, otp });
        Toast.show({ type: 'success', text1: 'Xác thực thành công' });
        // After successful registration verification, go to login
        router.replace('/auth/login');
      } else if (flow === 'reset') {
        await authApi.verifyForgotPasswordOtp(payload);
        Toast.show({ type: 'success', text1: 'OTP hợp lệ' });
        // navigate to reset-password screen (pass email & otp)
        router.push({
          pathname: '/auth/reset-password',
          params: { email, otp },
        });
      } else {
        // default fallback
        await authApi.verifyRegisterOtp({ name, phone, password, email, otp });
        router.replace('/auth/login');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || 'Xác thực thất bại';
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
            Xác thực OTP
          </Text>

          <View style={styles.form}>
            <Text variant="bodySmall" style={styles.label}>
              Email
            </Text>
            <TextInput
              value={email}
              mode="flat"
              disabled
              style={styles.input}
              textColor="#FFFFFF"
            />

            <Text variant="bodySmall" style={[styles.label, { marginTop: 12 }]}>
              Mã OTP
            </Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              mode="flat"
              keyboardType="number-pad"
              placeholder="Nhập mã OTP"
              style={styles.input}
              textColor="#FFFFFF"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              style={{ marginTop: 18 }}
            >
              <Surface style={styles.submitButton} elevation={3}>
                {loading ? (
                  <LoadingIndicator type="wave" size={22} color="#2F4F4F" />
                ) : (
                  <Text variant="titleMedium" style={styles.submitText}>
                    Xác thực OTP
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
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 24 },
  title: { textAlign: 'center', color: '#FFFFFF', marginBottom: 18 },
  form: { backgroundColor: 'transparent' },
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
  linkText: { color: '#FFFFFF', textAlign: 'center' },
});
