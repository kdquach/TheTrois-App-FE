import { useState } from 'react';
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
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin12345');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
                Sign In
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Sign in now to access your excercises
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                and saved music.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text variant="bodySmall" style={styles.inputLabel}>
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="flat"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="#8BA99E"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  theme={{
                    colors: {
                      onSurfaceVariant: 'rgba(255,255,255,0.5)',
                    },
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="bodySmall" style={styles.inputLabel}>
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="#8BA99E"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
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

              <TouchableOpacity style={styles.forgotPassword}>
                <Text variant="bodySmall" style={styles.forgotText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.loginButtonWrapper}
              >
                <Surface style={styles.loginButton} elevation={3}>
                  {loading ? (
                    <LoadingIndicator type="wave" size={28} color="#2F4F4F" />
                  ) : (
                    <Text variant="titleMedium" style={styles.loginButtonText}>
                      LOGIN
                    </Text>
                  )}
                </Surface>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupRow}>
                <Text variant="bodyMedium" style={styles.signupText}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text variant="bodyMedium" style={styles.signupLink}>
                    Sign Up
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.8)',
  },
  loginButtonWrapper: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#8BA99E',
    borderRadius: 12,
    paddingVertical: 16,
  },
  loginButtonText: {
    color: '#2F4F4F',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(255,255,255,0.8)',
  },
  signupLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  decorativeBottom: {
    alignItems: 'center',
    marginTop: 20,
  },
});
