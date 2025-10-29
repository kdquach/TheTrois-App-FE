import React, { useEffect, useState } from "react";
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
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { getMyAddresses, deleteAddress } from "../../api/addressesApi";

export default function AddressListScreen() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [confirm, setConfirm] = useState({ visible: false, item: null });

  const palette = {
    background: "#FAF9F6",
    card: "#FFFFFF",
    accent: "#A3C9A8",
    beige: "#E9E3D5",
    textPrimary: "#3E3B32",
    textSecondary: "#6B675F",
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
          borderRadius: 10,
          borderColor: palette.beige,
          backgroundColor: palette.card,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: "row", padding: 14, alignItems: "center" }}>
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
              iconColor="#D9534F"
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
    if (addresses.length >= 5) {
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
      <Appbar.Header style={{ backgroundColor: palette.accent }}>
        <Appbar.BackAction color="white" onPress={() => router.replace("/profile")} />
        <Appbar.Content title="Địa chỉ của tôi" color="white" />
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
        labelStyle={{ color: "white", fontWeight: "600", fontSize: 16 }}
      >
        Thêm địa chỉ
      </Button>

      <Portal>
        <Dialog
          visible={confirm.visible}
          onDismiss={() => setConfirm({ visible: false, item: null })}
          style={{ borderRadius: 10 }}
        >
          <Dialog.Title style={{ color: palette.textPrimary }}>Xóa địa chỉ?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: palette.textSecondary }}>
              Bạn có chắc chắn muốn xóa địa chỉ này?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm({ visible: false, item: null })}>
              Hủy
            </Button>
            <Button textColor="#D9534F" onPress={confirmDelete}>
              Xóa
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
