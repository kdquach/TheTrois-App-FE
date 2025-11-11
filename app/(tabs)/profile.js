import { useState, useEffect } from 'react';
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
import { useOrderStore } from '../../store/orderStore';
import Toast from 'react-native-toast-message';
import { changePassword } from '../../api/authApi';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateProfile, loading } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { orders, fetchOrders } = useOrderStore();

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



  useEffect(() => {
    // Fetch orders once to compute totals for overview
    if (!orders || orders.length === 0) {
      fetchOrders('completed').catch(() => {});
    }
  }, []);

  const safeNumber = (n) => (isFinite(n) ? n : 0);
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalSpent = Array.isArray(orders)
    ? orders.reduce((sum, o) => {
        const s = o?.total || o?.amount || o?.grandTotal || 0;
        return sum + safeNumber(Number(s));
      }, 0)
    : 0;
  // Streak placeholder (can be computed via login/activity data later)
  const streakDays = 7;
  const streakGoal = 30;
  const streakProgress = Math.max(0, Math.min(1, (streakDays || 0) / streakGoal));

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

  // (moved streakDays above to avoid TDZ issues)

  const currency = (n) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);
    } catch {
      return `${Math.round(n || 0).toLocaleString('vi-VN')} đ`;
    }
  };

  // Remove achievements/quick actions for simplified layout per request

  const settingsSections = [
    {
      title: 'Tài khoản',
      icon: 'account-circle',
      items: [
        { title: 'Chỉnh sửa thông tin', icon: 'account-edit', onPress: () => setEditDialogVisible(true) },
        { title: 'Danh sách địa chỉ', icon: 'map-marker-outline', onPress: () => router.push('/addresses') },
        { title: 'Đổi mật khẩu', icon: 'lock-reset', onPress: () => setChangePasswordDialogVisible(true) },
      ],
    },
    {
      title: 'Hỗ trợ',
      icon: 'help-circle',
      items: [
        { title: 'Điều khoản sử dụng', icon: 'file-document-outline', onPress: () => {} },
        { title: 'Chính sách bảo mật', icon: 'shield-check-outline', onPress: () => {} },
        { title: 'Liên hệ hỗ trợ', icon: 'phone-outline', onPress: () => {} },
        { title: 'Đánh giá ứng dụng', icon: 'star-outline', onPress: () => {} },
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
        {/* Row 1: Hero gradient (no outer margin), strong bottom radius, padded bottom for overlay */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.successStrong || theme.colors.primary]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Surface style={styles.avatarSurface}>
                {user?.avatar ? (
                  <Avatar.Image size={80} source={{ uri: user.avatar }} style={{ opacity: loading ? 0.4 : 1 }} />
                ) : (
                  <Avatar.Text size={80} label={user?.name?.charAt(0).toUpperCase() || 'U'} style={{ backgroundColor: theme.colors.accent }} labelStyle={styles.avatarLabel} />
                )}
                {loading && (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </Surface>
              {/* Smaller edit avatar icon (bottom-right overlay) */}
              <TouchableOpacity style={styles.cameraButtonBR} onPress={handlePickAvatar} activeOpacity={0.8}>
                <View style={styles.cameraCircle}>
                  <MaterialCommunityIcons name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { color: theme.colors.onPrimary }]}>{user?.name || 'Người dùng'}</Text>
            {user?.email && <Text style={[styles.userEmail, { color: theme.colors.onPrimary, opacity: 0.85 }]}>{user.email}</Text>}
          </View>
        </LinearGradient>

        {/* Row 2: Overview as a single grouped card */}
        <View style={styles.overviewWrapper}>
          <View style={[styles.overviewGroup, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <View style={[styles.metricIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <MaterialCommunityIcons name="shopping" size={18} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.overviewLabel}>Đơn đã mua</Text>
                  <Text style={styles.overviewValue}>{totalOrders}</Text>
                </View>
              </View>
              <View style={styles.metricItem}>
                <View style={[styles.metricIcon, { backgroundColor: `${theme.colors.accent}15` }]}>
                  <MaterialCommunityIcons name="cash-multiple" size={18} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.overviewLabel}>Đã chi</Text>
                  <Text style={styles.overviewValue}>{currency(totalSpent)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.streakRow}>
              <View style={[styles.metricIcon, { backgroundColor: `${theme.colors.dangerBright}15` }]}>
                <MaterialCommunityIcons name="fire" size={18} color={theme.colors.dangerBright} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <View style={styles.streakHeaderRow}>
                  <Text style={styles.overviewLabel}>Chuỗi ngày hoạt động</Text>
                  <Text style={styles.streakValue}>{streakDays} ngày</Text>
                </View>
                <ProgressBar progress={streakProgress} color={theme.colors.dangerBright} style={[styles.streakProgress, { backgroundColor: theme.colors.borderColor }]} />
              </View>
            </View>
          </View>
        </View>
            
        {/* Quick Actions removed per new design */}

        {/* Row 3: Settings sections and logout */}
        <View style={styles.row3Container}>
        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <View style={styles.settingsSection}>
            <View style={styles.settingsSectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View
                  style={[
                    styles.sectionIconWrapper,
                    { backgroundColor: `${theme.colors.primary}15` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={section.icon}
                    size={20}
                    color={theme.colors.primary}
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
                  titleStyle={[
                    styles.listItemTitle,
                    item.icon === 'map-marker-outline' && { fontSize: 14 },
                  ]}
                  left={(props) => (
                    <View style={styles.listIconWrapper}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={item.icon === 'map-marker-outline' ? 20 : 22}
                        color={theme.colors.onSurface}
                      />
                    </View>
                  )}
                  right={(props) =>
                    item.isSwitch ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onPress}
                        color={theme.colors.primary}
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
                  style={[
                    styles.listItem,
                    item.icon === 'map-marker-outline' && { paddingVertical: 0 },
                  ]}
                />
              </View>
            ))}
            </View>
          </View>
        ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButtonWrapper}
        >
          <View style={[styles.logoutContainer, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.dangerBright, theme.colors.error]}
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
          </View>
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
          style={[styles.dialogCard, { backgroundColor: theme.colors.surface }]}
        >
          <Dialog.Title style={styles.dialogTitle}>Chỉnh sửa thông tin</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
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
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setEditDialogVisible(false)} style={{ borderRadius: 10 }}>Hủy</Button>
            <Button
              onPress={handleUpdateProfile}
              mode="contained"
              style={{ backgroundColor: theme.colors.primary, borderRadius: 10 }}
            >
              Lưu
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={changePasswordDialogVisible}
          onDismiss={() => setChangePasswordDialogVisible(false)}
          style={[styles.dialogCard, { backgroundColor: theme.colors.surface }]}
        >
          <Dialog.Title style={styles.dialogTitle}>Đổi mật khẩu</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
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
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setChangePasswordDialogVisible(false)} style={{ borderRadius: 10 }}>
              Hủy
            </Button>
            <Button
              onPress={handleChangePassword}
              mode="contained"
              style={{ backgroundColor: theme.colors.primary, borderRadius: 10 }}
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
    paddingTop: 52,
    paddingBottom: 64, // leave space for overlap of row 2
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
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
  cameraButtonBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 12,
  },
  cameraCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginBottom: 12,
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

  // Row 2 overview
  overviewWrapper: {
    marginTop: -40, // pull up to overlap hero
    paddingHorizontal: 16,
    gap: 10,
  },
  overviewGroup: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    gap: 12,
    // subtle shadow for pop-up effect on row 2
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  overviewValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  streakProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
  },
  streakValue: {
    fontWeight: '700',
    fontSize: 16,
  },

  // Quick Actions removed

  // removed achievements section per new spec

  // Settings
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
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
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  row3Container: {
    paddingTop: 12,
  },
  dialogCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  dialogTitle: {
    fontWeight: '700',
  },
  dialogContent: {
    paddingTop: 0,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
