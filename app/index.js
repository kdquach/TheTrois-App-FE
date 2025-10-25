import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function WelcomeScreen() {
  const { token, checkAuthState } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuthState();
      setIsChecking(false);

      // Auto redirect if logged in
      if (token) {
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 500);
      }
    };

    initializeApp();
  }, [token, checkAuthState]);

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="headlineMedium" style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/welcome-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Surface style={styles.logoContainer} elevation={3}>
              <View style={styles.logoBox}>
                <Image
                  source={require('../assets/images/thetrois-logo.jpg')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </Surface>
            <Text variant="displaySmall" style={styles.welcomeText}>
              WELCOME
            </Text>
            <Text variant="titleMedium" style={styles.subtitleText}>
              Do meditation. Stay Focused.
            </Text>
            <Text variant="titleMedium" style={styles.subtitleText}>
              Live a healthy life.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.8}
            >
              <Surface style={styles.emailButton} elevation={2}>
                <Text variant="titleMedium" style={styles.emailButtonText}>
                  Login With Email
                </Text>
              </Surface>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text variant="bodyLarge" style={styles.signupText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text variant="bodyLarge" style={styles.signupLink}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5A7D7C',
  },
  loadingText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  welcomeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitleText: {
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  actionSection: {
    gap: 20,
  },
  emailButton: {
    backgroundColor: '#8BA99E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  emailButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#FFFFFF',
  },
  signupLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
