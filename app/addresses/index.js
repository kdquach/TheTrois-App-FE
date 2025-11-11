import React, { use, useCallback, useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  IconButton,
  List,
  Portal,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { useTheme } from 'react-native-paper';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { getMyAddresses, deleteAddress } from "../../api/addressesApi";
import { useAddressStore } from "../../store/addressStore";

export default function AddressListScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [confirm, setConfirm] = useState({ visible: false, item: null });

  const { setSelectedAddress } = useAddressStore();
  const { from } = useLocalSearchParams();

  // Colors come from theme (aligned with variables.css)
  const palette = {
    background: theme.colors.background,
    card: theme.colors.surface,
    accent: theme.colors.primary,
    beige: theme.colors.borderColor,
    textPrimary: theme.colors.textPrimary || theme.colors.onSurface,
    textSecondary: theme.colors.textSecondary || theme.colors.onSurfaceVariant,
  };
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const onChangeAddress = (address) => {
    setSelectedAddress(address);
    if (from === "cart") {
      router.back();
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getMyAddresses();
      setAddresses(res.results || []);
    } catch {
      Toast.show({ type: "error", text1: "Không thể tải danh sách địa chỉ" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    const { item } = confirm;
    setConfirm({ visible: false, item: null });
    if (!item) return;

    try {
      const res = await deleteAddress(item._id);
      Toast.show({
        type: "success",
        text1: res?.message || "Đã xóa địa chỉ",
      });
      fetchAddresses();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Xóa thất bại"; // lấy message từ API nếu có
      Toast.show({
        type: "error",
        text1: msg,
      });
    }
  };

  const renderItem = ({ item }) => {
    const address = [
      item.street,
      item.ward?.name,
      item.district?.name,
      item.city?.name,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <Card
        mode="outlined"
        style={{
          marginVertical: 8,
          borderRadius: 12,
          borderColor: palette.beige,
          backgroundColor: palette.card,
          elevation: 0,
        }}
        onPress={() => onChangeAddress(item)}
      >
        <View style={{ flexDirection: "row", padding: 14, alignItems: "center" }} >
          <View style={{ flex: 1 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "700", color: palette.textPrimary, marginBottom: 4 }}
            >
              {item.isDefault ? "Địa chỉ mặc định" : "Địa chỉ phụ"}
            </Text>
            <Text variant="bodyMedium" style={{ color: palette.textSecondary }} numberOfLines={2}>
              {address || "Chưa có địa chỉ cụ thể"}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="pencil"
              iconColor={palette.accent}
              onPress={() =>
                router.push({ pathname: "/addresses/form", params: { id: item._id } })
              }
            />
            <IconButton
              icon="delete"
              iconColor={theme.colors.dangerBright || '#D9534F'}
              onPress={() => setConfirm({ visible: true, item })}
            />
          </View>
        </View>
      </Card>
    );
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    if (addresses?.length >= 5) {
      Toast.show({
        type: "info",
        text1: "Bạn đã đạt tối đa 5 địa chỉ",
      });
      return;
    }
    router.push("/addresses/form");
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Appbar.Header style={{ backgroundColor: "transparent" }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Địa chỉ của tôi" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchAddresses}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            !loading && (
              <List.Item
                title="Chưa có địa chỉ nào"
                titleStyle={{ color: palette.textSecondary }}
              />
            )
          }
        />
      )}

      {/* Nút tạo địa chỉ */}
      <Button
        mode="contained"
        onPress={handleAddAddress}
        style={{
          position: "absolute",
          bottom: 20,
          left: 16,
          right: 16,
          borderRadius: 10,
          backgroundColor: addresses.length >= 5 ? "#CCC" : palette.accent,
          paddingVertical: 8,
        }}
        labelStyle={{ color: theme.colors.onPrimary, fontWeight: "600", fontSize: 16 }}
      >
        Thêm địa chỉ
      </Button>

      <Portal>
        <Dialog
          visible={confirm.visible}
          onDismiss={() => setConfirm({ visible: false, item: null })}
          style={{ borderRadius: 14, backgroundColor: palette.card }}
        >
          <Dialog.Title style={{ color: palette.textPrimary, fontWeight: '700' }}>Xóa địa chỉ?</Dialog.Title>
          <Dialog.Content style={{ paddingTop: 0 }}>
            <Text style={{ color: palette.textSecondary }}>
              Bạn có chắc chắn muốn xóa địa chỉ này?
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            <Button onPress={() => setConfirm({ visible: false, item: null })} style={{ borderRadius: 10 }}>
              Hủy
            </Button>
            <Button textColor={theme.colors.dangerBright || '#D9534F'} onPress={confirmDelete} style={{ borderRadius: 10 }}>
              Xóa
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
