import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TextInput, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';
import * as authApi from '../../api/authApi';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email = params?.email ?? '';
  const otp = params?.otp ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Validate that we have required params
    if (!email || !otp) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Thông tin không hợp lệ. Vui lòng thử lại.',
      });
      router.replace('/auth/login');
    }
  }, [email, otp]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập đầy đủ thông tin',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu xác nhận không khớp',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
      return;
    }

    setLoading(true);
    try {
      // Call resetPassword API with email, otp, and new password
      await authApi.resetPassword({
        email,
        password: newPassword,
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đổi mật khẩu thành công. Vui lòng đăng nhập.',
      });

      // Navigate to login after successful password reset
      router.replace('/auth/login');
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Đổi mật khẩu thất bại';
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: msg,
      });
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
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Surface style={styles.iconContainer} elevation={3}>
                <Image
                  source={require('../../assets/images/thetrois-logo.jpg')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Surface>
              <Text variant="headlineMedium" style={styles.title}>
                Đặt lại mật khẩu
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Nhập mật khẩu mới của bạn
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text variant="bodySmall" style={styles.inputLabel}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  mode="flat"
                  disabled
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="#8BA99E"
                  textColor="#FFFFFF"
                  theme={{
                    colors: {
                      onSurfaceVariant: 'rgba(255,255,255,0.5)',
                    },
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="bodySmall" style={styles.inputLabel}>
                  Mật khẩu mới
                </Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  mode="flat"
                  secureTextEntry={!showNewPassword}
                  placeholder="Nhập mật khẩu mới"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="#8BA99E"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  right={
                    <TextInput.Icon
                      icon={showNewPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      iconColor="rgba(255,255,255,0.7)"
                    />
                  }
                  theme={{
                    colors: {
                      onSurfaceVariant: 'rgba(255,255,255,0.5)',
                    },
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="bodySmall" style={styles.inputLabel}>
                  Xác nhận mật khẩu
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="flat"
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="#8BA99E"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      iconColor="rgba(255,255,255,0.7)"
                    />
                  }
                  theme={{
                    colors: {
                      onSurfaceVariant: 'rgba(255,255,255,0.5)',
                    },
                  }}
                />
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.resetButtonWrapper}
              >
                <Surface style={styles.resetButton} elevation={3}>
                  {loading ? (
                    <LoadingIndicator type="wave" size={28} color="#2F4F4F" />
                  ) : (
                    <Text variant="titleMedium" style={styles.resetButtonText}>
                      ĐỔI MẬT KHẨU
                    </Text>
                  )}
                </Surface>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.loginRow}>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text variant="bodyMedium" style={styles.loginLink}>
                    Quay lại đăng nhập
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Decorative Bottom */}
            <View style={styles.decorativeBottom}>
              <MaterialCommunityIcons
                name="leaf"
                size={80}
                color="rgba(255,255,255,0.1)"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  resetButtonWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#8BA99E',
    borderRadius: 12,
    paddingVertical: 16,
  },
  resetButtonText: {
    color: '#2F4F4F',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  decorativeBottom: {
    alignItems: 'center',
    marginTop: 20,
  },
});
