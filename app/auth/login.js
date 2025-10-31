import { useState, useEffect, useMemo } from 'react';
import * as React from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin12345');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuthStore();

  // Get Google Client IDs from config
  const googleWebClientId =
    Constants.expoConfig?.extra?.VITE_GOOGLE_CLIENT_ID || '';
  const googleAndroidClientId =
    Constants.expoConfig?.extra?.VITE_GOOGLE_ANDROID_CLIENT_ID || '';

  console.log('📋 Web Client ID:', googleWebClientId);
  console.log('📋 Android Client ID:', googleAndroidClientId);
  console.log('📱 Platform:', Platform.OS);
  console.log('🏗️ App Ownership:', Constants.appOwnership);
  console.log('📦 Execution Environment:', Constants.executionEnvironment);

  // Always use Expo Go mode since we're using expo://
  const isRunningInExpoGo = true; // Force Expo Go mode for now

  const redirectUri = makeRedirectUri({
    useProxy: true,
  });

  console.log('🔁 Redirect URI:', redirectUri);

  // Build auth config - use useMemo to ensure stable reference
  const authConfig = useMemo(() => {
    const config = {
      redirectUri,
      expoClientId: googleWebClientId, // For Expo Go
      webClientId: googleWebClientId, // Always include webClientId
    };

    // Add platform-specific client IDs
    if (Platform.OS === 'android' && googleAndroidClientId) {
      config.androidClientId = googleAndroidClientId;
    }
    if (Platform.OS === 'ios' && googleWebClientId) {
      config.iosClientId = googleWebClientId;
    }

    console.log('🔧 Auth Config:', JSON.stringify(config, null, 2));
    return config;
  }, [redirectUri, googleWebClientId, googleAndroidClientId]);

  // Force Expo proxy while inside Expo Go
  const [request, response, promptAsync] = Google.useAuthRequest(
    authConfig,
    undefined,
    {
      useProxy: true, // Always use proxy for now
    }
  ); // Handle Google OAuth response
  useEffect(() => {
    console.log(
      '📬 OAuth Response changed:',
      JSON.stringify(response, null, 2)
    );

    if (response?.type === 'success') {
      console.log('✅ Success! Processing authentication...');
      const { authentication } = response;
      handleGoogleAuthSuccess(authentication);
    } else if (response?.type === 'error') {
      console.error('❌ OAuth Error:', response.error);
      console.error('Error params:', response.params);
      Toast.show({
        type: 'error',
        text1: 'Lỗi Google OAuth',
        text2: response.error?.message || 'Đăng nhập Google thất bại',
      });
      setGoogleLoading(false);
    } else if (response?.type === 'dismiss') {
      console.log('⚠️ User dismissed OAuth dialog');
      setGoogleLoading(false);
    } else if (response) {
      console.log('ℹ️ Other response type:', response.type);
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (authentication) => {
    try {
      console.log(
        '🎫 Full authentication object:',
        JSON.stringify(authentication, null, 2)
      );

      if (!authentication?.idToken && !authentication?.accessToken) {
        throw new Error('Không nhận được token từ Google');
      }

      const token = authentication.idToken || authentication.accessToken;
      console.log(
        '📤 Sending token to backend:',
        token?.substring(0, 30) + '...'
      );

      // Call backend API with Google token
      const result = await loginWithGoogle({ token });
      console.log('✅ Backend response:', result);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đăng nhập Google thành công!',
      });

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);

      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đăng nhập Google thất bại',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

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

  const handleGoogleLogin = async () => {
    console.log('🚀 Google login button clicked!');
    console.log('📱 Platform:', Platform.OS);
    console.log('🏃 Running in Expo Go:', isRunningInExpoGo);
    console.log('🔑 Web Client ID:', googleWebClientId ? '✓' : '✗');
    console.log('🔑 Android Client ID:', googleAndroidClientId ? '✓' : '✗');
    console.log('📋 Request object:', request);

    // Validation
    if (!googleWebClientId) {
      console.error('❌ Google Web Client ID not configured!');
      Toast.show({
        type: 'error',
        text1: 'Lỗi cấu hình',
        text2: 'Thiếu Google Web Client ID trong file .env',
      });
      return;
    }

    if (
      Platform.OS === 'android' &&
      !googleAndroidClientId &&
      !isRunningInExpoGo
    ) {
      console.error('❌ Google Android Client ID not configured!');
      Toast.show({
        type: 'error',
        text1: 'Lỗi cấu hình',
        text2: 'Thiếu VITE_GOOGLE_ANDROID_CLIENT_ID trong file .env',
        text1Style: { fontSize: 14 },
        text2Style: { fontSize: 12 },
      });
      return;
    }

    if (!request) {
      console.error('❌ Google auth request not ready!');
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Google auth chưa sẵn sàng, vui lòng thử lại',
      });
      return;
    }

    setGoogleLoading(true);
    try {
      console.log('🔓 Calling promptAsync...');
      const result = await promptAsync({ useProxy: isRunningInExpoGo });
      console.log('📨 PromptAsync result:', result);
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đăng nhập Google thất bại',
      });
      setGoogleLoading(false);
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

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/auth/forgot-password')}
              >
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

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text variant="bodySmall" style={styles.dividerText}>
                  OR
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-In Button */}
              <TouchableOpacity
                onPress={handleGoogleLogin}
                disabled={googleLoading || loading}
                activeOpacity={0.8}
                style={styles.googleButtonWrapper}
              >
                <Surface style={styles.googleButton} elevation={2}>
                  {googleLoading ? (
                    <LoadingIndicator type="wave" size={22} color="#FFFFFF" />
                  ) : (
                    <View style={styles.googleButtonContent}>
                      <MaterialCommunityIcons
                        name="google"
                        size={24}
                        color="#FFFFFF"
                      />
                      <Text variant="bodyLarge" style={styles.googleButtonText}>
                        Đăng nhập với Google
                      </Text>
                    </View>
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 12,
    fontSize: 12,
  },
  googleButtonWrapper: {
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#DB4437',
    borderRadius: 12,
    paddingVertical: 14,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
