import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import LoadingIndicator from '../components/LoadingIndicator';

/**
 * Demo tất cả các animation types từ react-native-loader-kit
 *
 * Sử dụng:
 * import LoadingDemo from './docs/LoadingDemo';
 * <LoadingDemo />
 */

export default function LoadingDemo() {
  const theme = useTheme();

  const animations = [
    {
      type: 'pulse',
      name: 'Pulse',
      description: 'Vòng tròn phóng to thu nhỏ - Giống bong bóng trà 🧋',
      recommended: true,
    },
    {
      type: 'bounce',
      name: 'Bounce (ThreeBounce)',
      description: 'Ba chấm nảy - Giống trân châu 💧',
      recommended: true,
    },
    {
      type: 'wave',
      name: 'Wave',
      description: 'Sóng chuyển động - Như chất lỏng 🌊',
      recommended: true,
    },
    {
      type: 'flow',
      name: 'Flow',
      description: 'Chuyển động mượt - Như rót trà sữa ☕',
      recommended: true,
    },
    {
      type: 'bars',
      name: 'Bars',
      description: 'Các thanh nhảy - Như level trà sữa 📊',
      recommended: true,
    },
    {
      type: 'circle',
      name: 'Circle',
      description: 'Vòng tròn xoay - Classic spinner',
      recommended: false,
    },
    {
      type: 'snail',
      name: 'Circle Snail',
      description: 'Vòng tròn mượt - Smooth rotation',
      recommended: false,
    },
    {
      type: 'dots',
      name: 'Chasing Dots',
      description: 'Hai chấm đuổi nhau',
      recommended: false,
    },
    {
      type: 'swing',
      name: 'Swing',
      description: 'Swing animation',
      recommended: false,
    },
    {
      type: 'double',
      name: 'Double Bounce',
      description: 'Double bounce effect',
      recommended: false,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={styles.title}>
        🎨 Loading Animations Demo
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Tất cả animation types từ react-native-loader-kit
      </Text>

      {/* Recommended Animations */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          ⭐ PHÙ HỢP CHO TRÀ SỮA
        </Text>
        {animations
          .filter((anim) => anim.recommended)
          .map((anim, index) => (
            <Surface key={index} style={styles.card} elevation={2}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={styles.animName}>
                  {anim.name}
                </Text>
                <Text variant="bodySmall" style={styles.animType}>
                  type="{anim.type}"
                </Text>
              </View>

              <Text variant="bodyMedium" style={styles.animDesc}>
                {anim.description}
              </Text>

              <View style={styles.demoContainer}>
                {/* Small Size */}
                <View style={styles.demoItem}>
                  <LoadingIndicator
                    type={anim.type}
                    size="small"
                    color={theme.colors.starbucksGreen}
                  />
                  <Text variant="bodySmall" style={styles.sizeLabel}>
                    Small
                  </Text>
                </View>

                {/* Medium Size */}
                <View style={styles.demoItem}>
                  <LoadingIndicator
                    type={anim.type}
                    size={40}
                    color={theme.colors.starbucksGreen}
                  />
                  <Text variant="bodySmall" style={styles.sizeLabel}>
                    Medium
                  </Text>
                </View>

                {/* Large Size */}
                <View style={styles.demoItem}>
                  <LoadingIndicator
                    type={anim.type}
                    size="large"
                    color={theme.colors.starbucksGreen}
                  />
                  <Text variant="bodySmall" style={styles.sizeLabel}>
                    Large
                  </Text>
                </View>
              </View>

              {/* Code Example */}
              <Surface style={styles.codeBlock} elevation={0}>
                <Text style={styles.codeText}>
                  {`<LoadingIndicator\n  type="${anim.type}"\n  size="large"\n  color="#00704A"\n  text="Loading..."\n/>`}
                </Text>
              </Surface>
            </Surface>
          ))}
      </View>

      {/* Other Animations */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          📦 ANIMATIONS KHÁC
        </Text>
        {animations
          .filter((anim) => !anim.recommended)
          .map((anim, index) => (
            <Surface key={index} style={styles.card} elevation={1}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={styles.animName}>
                  {anim.name}
                </Text>
                <Text variant="bodySmall" style={styles.animType}>
                  type="{anim.type}"
                </Text>
              </View>

              <Text variant="bodyMedium" style={styles.animDesc}>
                {anim.description}
              </Text>

              <View style={styles.demoContainer}>
                <View style={styles.demoItem}>
                  <LoadingIndicator
                    type={anim.type}
                    size={40}
                    color={theme.colors.primary}
                  />
                </View>
              </View>
            </Surface>
          ))}
      </View>

      {/* Color Variations */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          🎨 COLOR VARIATIONS
        </Text>
        <Surface style={styles.card} elevation={2}>
          <Text variant="titleMedium" style={styles.animName}>
            Pulse với các màu khác nhau
          </Text>

          <View style={styles.colorDemoContainer}>
            <View style={styles.colorItem}>
              <LoadingIndicator
                type="pulse"
                size={40}
                color={theme.colors.starbucksGreen}
              />
              <Text variant="bodySmall" style={styles.colorLabel}>
                Starbucks Green
              </Text>
            </View>

            <View style={styles.colorItem}>
              <LoadingIndicator type="pulse" size={40} color="#D4AF37" />
              <Text variant="bodySmall" style={styles.colorLabel}>
                Gold
              </Text>
            </View>

            <View style={styles.colorItem}>
              <LoadingIndicator type="pulse" size={40} color="#8B4513" />
              <Text variant="bodySmall" style={styles.colorLabel}>
                Brown
              </Text>
            </View>

            <View style={styles.colorItem}>
              <LoadingIndicator type="pulse" size={40} color="#FF6B6B" />
              <Text variant="bodySmall" style={styles.colorLabel}>
                Red
              </Text>
            </View>
          </View>
        </Surface>
      </View>

      {/* Usage Guide */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          📖 HƯỚNG DẪN SỬ DỤNG
        </Text>
        <Surface style={styles.card} elevation={2}>
          <Text variant="titleMedium" style={styles.guideTitle}>
            1. Import Component
          </Text>
          <Surface style={styles.codeBlock} elevation={0}>
            <Text style={styles.codeText}>
              {`import LoadingIndicator from '../components/LoadingIndicator';`}
            </Text>
          </Surface>

          <Text
            variant="titleMedium"
            style={[styles.guideTitle, { marginTop: 16 }]}
          >
            2. Sử dụng trong Component
          </Text>
          <Surface style={styles.codeBlock} elevation={0}>
            <Text style={styles.codeText}>
              {`<LoadingIndicator\n  type="pulse"           // Animation type\n  size="large"          // small | large | number\n  color="#00704A"       // Hex color\n  text="Loading..."     // Optional text\n/>`}
            </Text>
          </Surface>

          <Text
            variant="titleMedium"
            style={[styles.guideTitle, { marginTop: 16 }]}
          >
            3. Với LoadingContext
          </Text>
          <Surface style={styles.codeBlock} elevation={0}>
            <Text style={styles.codeText}>
              {`const { showLoading, hideLoading } = useLoading();\n\nshowLoading('Đang xử lý...', 'pulse');\n// ... async task ...\nhideLoading();`}
            </Text>
          </Surface>
        </Surface>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          💡 KHUYẾN NGHỊ
        </Text>
        <Surface style={styles.card} elevation={2}>
          <View style={styles.recommendItem}>
            <Text style={styles.recommendIcon}>🏠</Text>
            <View style={styles.recommendText}>
              <Text variant="titleSmall">Home Screen</Text>
              <Text variant="bodySmall">Dùng pulse - giống bong bóng trà</Text>
            </View>
          </View>

          <View style={styles.recommendItem}>
            <Text style={styles.recommendIcon}>📋</Text>
            <View style={styles.recommendText}>
              <Text variant="titleSmall">Orders Screen</Text>
              <Text variant="bodySmall">Dùng wave - như chất lỏng</Text>
            </View>
          </View>

          <View style={styles.recommendItem}>
            <Text style={styles.recommendIcon}>🔐</Text>
            <View style={styles.recommendText}>
              <Text variant="titleSmall">Login/Register Buttons</Text>
              <Text variant="bodySmall">Dùng bounce - như trân châu</Text>
            </View>
          </View>

          <View style={styles.recommendItem}>
            <Text style={styles.recommendIcon}>⏳</Text>
            <View style={styles.recommendText}>
              <Text variant="titleSmall">API Calls</Text>
              <Text variant="bodySmall">Dùng flow - chuyển động mượt</Text>
            </View>
          </View>
        </Surface>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Powered by react-native-loader-kit 🚀
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  animName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  animType: {
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  animDesc: {
    marginBottom: 16,
    opacity: 0.8,
  },
  demoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  demoItem: {
    alignItems: 'center',
    gap: 8,
  },
  sizeLabel: {
    opacity: 0.6,
  },
  codeBlock: {
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#a9dc76',
    lineHeight: 18,
  },
  colorDemoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
    gap: 16,
  },
  colorItem: {
    alignItems: 'center',
    gap: 8,
  },
  colorLabel: {
    opacity: 0.6,
    textAlign: 'center',
  },
  guideTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendIcon: {
    fontSize: 32,
  },
  recommendText: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    opacity: 0.5,
  },
});
