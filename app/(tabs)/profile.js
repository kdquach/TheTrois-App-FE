import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Text,
  Button,
  List,
  Switch,
  Avatar,
  Divider,
  Dialog,
  Portal,
  TextInput,
  Surface,
  Badge,
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Toast from 'react-native-toast-message';
import { changePassword } from '../../api/authApi';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateProfile, loading } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [changePasswordDialogVisible, setChangePasswordDialogVisible] =
    useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Toast.show({
            type: 'success',
            text1: 'Đăng xuất thành công',
            text2: 'Hẹn gặp lại bạn!',
          });
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập họ tên',
      });
      return;
    }

    try {
      const response = await updateProfile(editForm);
      setEditDialogVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: response.message || 'Cập nhật thông tin thành công',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Cập nhật thất bại',
      });
    }
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Quyền bị từ chối',
          text2: 'Vui lòng cấp quyền truy cập thư viện ảnh để tải lên avatar',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Toast.show({ type: 'error', text1: 'Không lấy được ảnh' });
        return;
      }

      const uri = asset.uri;
      const filenameFromUri = uri.split('/').pop() || `avatar_${Date.now()}.jpg`;
      const ext = (filenameFromUri.split('.').pop() || 'jpg').toLowerCase();
      const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic' };
      const type = asset.mimeType || mimeMap[ext] || 'image/jpeg';

      const file = { uri, name: filenameFromUri, type };

      // Gọi updateProfile trong store để upload avatar
      await updateProfile({ avatar: file });
      Toast.show({
        type: 'success',
        text1: 'Cập nhật avatar thành công',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Tải lên thất bại',
        text2: error?.message || 'Vui lòng thử lại',
      });
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng điền đầy đủ thông tin',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới không khớp',
      });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải có ít nhất 8 ký tự',
      });
      return;
    }

    try {
      setChangePasswordDialogVisible(false);
      await changePassword({ currentPassword, newPassword });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đổi mật khẩu thành công',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đổi mật khẩu thất bại',
      });
    }
  };

  const quickActions = [
    {
      icon: 'receipt-text',
      label: 'Đơn hàng',
      color: theme.colors.starbucksGreen,
      badge: '3',
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      icon: 'heart',
      label: 'Yêu thích',
      color: '#FF6B9D',
      badge: '12',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Tính năng đang phát triển',
        });
      },
    },
    {
      icon: 'ticket-percent',
      label: 'Voucher',
      color: '#FFB74D',
      badge: '5',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Tính năng đang phát triển',
        });
      },
    },
    {
      icon: 'wallet-giftcard',
      label: 'Quà tặng',
      color: '#FF5252',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Tính năng đang phát triển',
        });
      },
    },
  ];

  const statistics = [
    {
      icon: 'shopping',
      label: 'Đơn hàng',
      value: '28',
      color: theme.colors.starbucksGreen,
    },
    {
      icon: 'cup',
      label: 'Sản phẩm',
      value: '156',
      color: '#00BCD4',
    },
    {
      icon: 'cash-multiple',
      label: 'Chi tiêu',
      value: '2.5M',
      color: '#FF9800',
    },
    {
      icon: 'trophy',
      label: 'Thành tựu',
      value: '12',
      color: theme.colors.starbucksGold,
    },
  ];

  const achievements = [
    {
      icon: 'fire',
      title: 'Streak Master',
      description: '7 ngày liên tiếp',
      progress: 0.7,
      color: '#FF6B35',
    },
    {
      icon: 'star-circle',
      title: 'VIP Member',
      description: 'Hạng Gold',
      progress: 0.85,
      color: theme.colors.starbucksGold,
    },
  ];

  const settingsSections = [
    {
      title: 'Tài khoản',
      icon: 'account-circle',
      items: [
        {
          title: 'Thông tin cá nhân',
          icon: 'account-edit',
          onPress: () => setEditDialogVisible(true),
        },
        {
          title: 'Đổi mật khẩu',
          icon: 'lock-reset',
          onPress: () => setChangePasswordDialogVisible(true),
        },
      ],
    },
    {
      title: 'Cài đặt',
      icon: 'cog',
      items: [
        {
          title: 'Chế độ tối',
          icon: 'theme-light-dark',
          isSwitch: true,
          value: isDarkMode,
          onPress: toggleTheme,
        },
        {
          title: 'Thông báo',
          icon: 'bell-outline',
          isSwitch: true,
          value: true,
          onPress: () => { },
        },
      ],
    },
    {
      title: 'Hỗ trợ',
      icon: 'help-circle',
      items: [
        {
          title: 'Điều khoản sử dụng',
          icon: 'file-document-outline',
          onPress: () => { },
        },
        {
          title: 'Chính sách bảo mật',
          icon: 'shield-check-outline',
          onPress: () => { },
        },
        {
          title: 'Liên hệ hỗ trợ',
          icon: 'phone-outline',
          onPress: () => { },
        },
        {
          title: 'Đánh giá ứng dụng',
          icon: 'star-outline',
          onPress: () => { },
        },
      ],
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Hero Section */}
        <LinearGradient
          colors={[theme.colors.starbucksGreen, '#00695C', '#004D40']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Avatar & Info */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Surface style={styles.avatarSurface} elevation={8}>
                {user?.avatar ? (
                  <Avatar.Image
                    size={90}
                    source={{ uri: user.avatar }}
                    style={{
                      borderColor: '#FFFFFF',
                      opacity: loading ? 0.4 : 1, // Làm mờ khi đang upload
                    }}

                  />
                ) : (
                  <Avatar.Text
                    size={90}
                    label={user?.name?.charAt(0).toUpperCase() || 'U'}
                    style={{
                      backgroundColor: theme.colors.starbucksGold,
                      borderWidth: 4,
                      borderColor: '#FFFFFF',
                    }}
                    labelStyle={styles.avatarLabel}
                  />
                )}
                {/* 🔥 Overlay loading trong avatar */}
                {loading && (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </Surface>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handlePickAvatar}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.starbucksGold, '#D4A574']}
                  style={styles.cameraGradient}
                >
                  <MaterialCommunityIcons
                    name="camera"
                    size={18}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text variant="headlineMedium" style={styles.userName}>
              {user?.name || 'Người dùng'}
            </Text>
            <Text variant="bodyLarge" style={styles.userEmail}>
              {user?.email || 'user@example.com'}
            </Text>
            {user?.phone && (
              <View style={styles.phoneContainer}>
                <MaterialCommunityIcons
                  name="cellphone"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text variant="bodyMedium" style={styles.userPhone}>
                  {user.phone}
                </Text>
              </View>
            )}

            {/* Level & Points Card */}
            <Surface style={styles.levelCard} elevation={4}>
              <View style={styles.levelContent}>
                <View style={styles.levelLeft}>
                  <View style={styles.levelBadge}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={24}
                      color={theme.colors.starbucksGold}
                    />
                  </View>
                  <View>
                    <Text variant="labelSmall" style={styles.levelLabel}>
                      Hạng thành viên
                    </Text>
                    <Text variant="titleLarge" style={styles.levelText}>
                      Gold Member
                    </Text>
                  </View>
                </View>
                <Divider style={styles.levelDivider} />
                <View style={styles.levelRight}>
                  <MaterialCommunityIcons
                    name="star-circle"
                    size={24}
                    color={theme.colors.starbucksGold}
                  />
                  <View style={styles.pointsInfo}>
                    <Text variant="titleLarge" style={styles.pointsValue}>
                      2,580
                    </Text>
                    <Text variant="labelSmall" style={styles.pointsLabel}>
                      Điểm tích lũy
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text variant="labelSmall" style={styles.progressLabel}>
                    420 điểm nữa để lên Platinum
                  </Text>
                  <Text variant="labelSmall" style={styles.progressPercent}>
                    86%
                  </Text>
                </View>
                <ProgressBar
                  progress={0.86}
                  color={theme.colors.starbucksGold}
                  style={styles.progressBar}
                />
              </View>
            </Surface>
          </View>
        </LinearGradient>

        {/* Statistics Grid */}
        <View style={styles.statsContainer}>
          {statistics.map((stat, index) => (
            <Surface key={index} style={styles.statCard} elevation={2}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${stat.color}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text variant="headlineSmall" style={styles.statValue}>
                {stat.value}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {stat.label}
              </Text>
            </Surface>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text variant="titleMedium" style={styles.sectionHeading}>
            Tiện ích nhanh
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                activeOpacity={0.7}
                style={styles.actionItem}
              >
                <Surface style={styles.actionCard} elevation={3}>
                  <View style={styles.actionIconWrapper}>
                    <View
                      style={[
                        styles.actionIcon,
                        { backgroundColor: `${action.color}20` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={action.icon}
                        size={26}
                        color={action.color}
                      />
                    </View>
                    {action.badge && (
                      <Badge style={styles.actionBadge} size={18}>
                        {action.badge}
                      </Badge>
                    )}
                  </View>
                  <Text
                    variant="labelMedium"
                    style={styles.actionLabel}
                    numberOfLines={1}
                  >
                    {action.label}
                  </Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text variant="titleMedium" style={styles.sectionHeading}>
            Thành tựu
          </Text>
          {achievements.map((achievement, index) => (
            <Surface key={index} style={styles.achievementCard} elevation={2}>
              <View
                style={[
                  styles.achievementIcon,
                  { backgroundColor: `${achievement.color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={achievement.icon}
                  size={28}
                  color={achievement.color}
                />
              </View>
              <View style={styles.achievementContent}>
                <Text variant="titleSmall" style={styles.achievementTitle}>
                  {achievement.title}
                </Text>
                <Text variant="bodySmall" style={styles.achievementDesc}>
                  {achievement.description}
                </Text>
                <ProgressBar
                  progress={achievement.progress}
                  color={achievement.color}
                  style={styles.achievementProgress}
                />
              </View>
            </Surface>
          ))}
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Surface
            key={sectionIndex}
            style={styles.settingsSection}
            elevation={2}
          >
            <View style={styles.settingsSectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View
                  style={[
                    styles.sectionIconWrapper,
                    { backgroundColor: `${theme.colors.starbucksGreen}15` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={section.icon}
                    size={20}
                    color={theme.colors.starbucksGreen}
                  />
                </View>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  {section.title}
                </Text>
              </View>
            </View>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex}>
                <List.Item
                  title={item.title}
                  titleStyle={styles.listItemTitle}
                  left={(props) => (
                    <View style={styles.listIconWrapper}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={22}
                        color={theme.colors.onSurface}
                      />
                    </View>
                  )}
                  right={(props) =>
                    item.isSwitch ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onPress}
                        color={theme.colors.starbucksGreen}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )
                  }
                  onPress={item.onPress}
                  style={styles.listItem}
                />
                {itemIndex < section.items.length - 1 && (
                  <Divider style={styles.itemDivider} />
                )}
              </View>
            ))}
          </Surface>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButtonWrapper}
        >
          <Surface style={styles.logoutContainer} elevation={3}>
            <LinearGradient
              colors={['#EF5350', '#E53935']}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons
                name="logout-variant"
                size={22}
                color="#FFFFFF"
              />
              <Text variant="titleMedium" style={styles.logoutText}>
                Đăng xuất
              </Text>
            </LinearGradient>
          </Surface>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <MaterialCommunityIcons
            name="information-outline"
            size={14}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodySmall" style={styles.versionText}>
            Version 1.0.0 • Build 100
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Dialog */}
      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>Chỉnh sửa thông tin</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Họ và tên"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Số điện thoại"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Hủy</Button>
            <Button
              onPress={handleUpdateProfile}
              mode="contained"
              style={{ backgroundColor: theme.colors.starbucksGreen }}
            >
              Lưu
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog
          visible={changePasswordDialogVisible}
          onDismiss={() => setChangePasswordDialogVisible(false)}
        >
          <Dialog.Title>Đổi mật khẩu</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Mật khẩu hiện tại"
              value={passwordForm.currentPassword}
              onChangeText={(text) =>
                setPasswordForm({ ...passwordForm, currentPassword: text })
              }
              mode="outlined"
              secureTextEntry={!showCurrentPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrentPassword((v) => !v)}
                />
              }
            />
            <TextInput
              label="Mật khẩu mới"
              value={passwordForm.newPassword}
              onChangeText={(text) =>
                setPasswordForm({ ...passwordForm, newPassword: text })
              }
              mode="outlined"
              secureTextEntry={!showNewPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-reset" />}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword((v) => !v)}
                />
              }
            />
            <TextInput
              label="Xác nhận mật khẩu mới"
              value={passwordForm.confirmPassword}
              onChangeText={(text) =>
                setPasswordForm({ ...passwordForm, confirmPassword: text })
              }
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword((v) => !v)}
                />
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangePasswordDialogVisible(false)}>
              Hủy
            </Button>
            <Button
              onPress={handleChangePassword}
              mode="contained"
              style={{ backgroundColor: theme.colors.starbucksGreen }}
            >
              Đổi mật khẩu
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero Section
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarSurface: {
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  userPhone: {
    color: 'rgba(255,255,255,0.9)',
  },

  // Level Card
  levelCard: {
    width: width - 40,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  levelText: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  levelDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  levelRight: {
    alignItems: 'center',
    gap: 8,
  },
  pointsInfo: {
    alignItems: 'center',
  },
  pointsValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  pointsLabel: {
    opacity: 0.7,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    opacity: 0.7,
  },
  progressPercent: {
    fontWeight: '600',
    color: '#2E7D32',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
  },

  // Statistics
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 30,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeading: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: (width - 52) / 4,
  },
  actionCard: {
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionIconWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    color: '#FFFFFF',
  },
  actionLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },

  // Achievements
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    opacity: 0.7,
    marginBottom: 8,
  },
  achievementProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
  },

  // Settings
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  settingsSectionHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  listItem: {
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  listItemTitle: {
    fontSize: 15,
  },
  listIconWrapper: {
    marginLeft: 8,
    marginRight: 16,
  },
  itemDivider: {
    marginLeft: 70,
  },

  // Logout
  logoutButtonWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  logoutContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Version
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  versionText: {
    opacity: 0.6,
    fontSize: 12,
  },

  // Dialogs
  input: {
    marginBottom: 12,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // lớp mờ trên avatar
    borderRadius: 90 / 2, // bo tròn để khớp với avatar
  },

});
