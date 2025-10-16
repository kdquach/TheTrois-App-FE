import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Appbar, 
  Card, 
  Text, 
  Button, 
  List, 
  Switch, 
  Avatar,
  Divider,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateProfile } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [changePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogout = async () => {
    await logout();
    Toast.show({
      type: 'success',
      text1: 'Đăng xuất thành công',
      text2: 'Hẹn gặp lại bạn!',
    });
    router.replace('/auth/login');
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
      await updateProfile(editForm);
      setEditDialogVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật thông tin thành công',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Cập nhật thất bại',
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

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
      return;
    }

    try {
      // Mock change password
      setChangePasswordDialogVisible(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đổi mật khẩu thành công',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đổi mật khẩu thất bại',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Tài khoản" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <Card.Content style={styles.userInfo}>
            <Avatar.Text 
              size={64} 
              label={user?.name?.charAt(0)?.toUpperCase() || 'U'} 
            />
            <View style={styles.userDetails}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.name || 'Người dùng'}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </Text>
              <Text variant="bodyMedium" style={styles.userPhone}>
                {user?.phone || 'Chưa có số điện thoại'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.card}>
          <Card.Title title="Thông tin tài khoản" />
          <Card.Content>
            <List.Item
              title="Chỉnh sửa thông tin"
              description="Cập nhật tên và số điện thoại"
              left={(props) => <List.Icon {...props} icon="account-edit" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setEditDialogVisible(true)}
            />
            <Divider />
            <List.Item
              title="Đổi mật khẩu"
              description="Thay đổi mật khẩu đăng nhập"
              left={(props) => <List.Icon {...props} icon="lock-reset" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setChangePasswordDialogVisible(true)}
            />
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Title title="Cài đặt ứng dụng" />
          <Card.Content>
            <List.Item
              title="Chế độ tối"
              description="Bật/tắt giao diện tối"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Thông báo"
              description="Quản lý thông báo ứng dụng"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Thông tin',
                text2: 'Tính năng đang phát triển',
              })}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Title title="Hỗ trợ" />
          <Card.Content>
            <List.Item
              title="Liên hệ"
              description="Gửi phản hồi hoặc báo lỗi"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Thông tin',
                text2: 'Tính năng đang phát triển',
              })}
            />
            <Divider />
            <List.Item
              title="Về ứng dụng"
              description="Phiên bản 1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Bubble Tea Shop',
                text2: 'Phiên bản 1.0.0 - Tạo bởi Bolt AI',
              })}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          Đăng xuất
        </Button>
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
              onChangeText={(value) => setEditForm(prev => ({ ...prev, name: value }))}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Số điện thoại"
              value={editForm.phone}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, phone: value }))}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Hủy</Button>
            <Button onPress={handleUpdateProfile}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Change Password Dialog */}
      <Portal>
        <Dialog 
          visible={changePasswordDialogVisible} 
          onDismiss={() => setChangePasswordDialogVisible(false)}
        >
          <Dialog.Title>Đổi mật khẩu</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Mật khẩu hiện tại"
              value={passwordForm.currentPassword}
              onChangeText={(value) => setPasswordForm(prev => ({ ...prev, currentPassword: value }))}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Mật khẩu mới"
              value={passwordForm.newPassword}
              onChangeText={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value }))}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Xác nhận mật khẩu mới"
              value={passwordForm.confirmPassword}
              onChangeText={(value) => setPasswordForm(prev => ({ ...prev, confirmPassword: value }))}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangePasswordDialogVisible(false)}>Hủy</Button>
            <Button onPress={handleChangePassword}>Đổi mật khẩu</Button>
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
  content: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  userEmail: {
    marginTop: 4,
  },
  userPhone: {
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
  },
  logoutButton: {
    marginVertical: 20,
  },
  dialogInput: {
    marginBottom: 16,
  },
});