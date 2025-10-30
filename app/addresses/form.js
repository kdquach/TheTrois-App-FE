import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Appbar,
  Button,
  Switch,
  Text,
  TextInput,
  Divider,
  Surface,
  ActivityIndicator,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  createAddress,
  getAddressById,
  updateAddress,
} from "../../api/addressesApi";
import { getProvinces, getDistricts, getWards } from "vietnam-provinces";
import { useAuthStore } from "../../store/authStore";

export default function AddressForm() {
  const { id, from } = useLocalSearchParams();
  const { fetchUser, updateAddress } = useAuthStore();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    street: "",
    city: null,
    district: null,
    ward: null,
    isDefault: false,
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistrictsList] = useState([]);
  const [wards, setWardsList] = useState([]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Load provinces
  useEffect(() => {
    const provinces = getProvinces();
    setCities(provinces);
  }, []);

  // Load address nếu edit
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await getAddressById(id);
        if (!res) return;

        setForm({
          street: res.street || "",
          city: res.city || null,
          district: res.district || null,
          ward: res.ward || null,
          isDefault: res.isDefault || false,
        });

        if (res.city?.code) {
          const districtsList = getDistricts(res.city.code);
          setDistrictsList(districtsList);
        }

        if (res.district?.code) {
          const wardsList = getWards(res.district.code);
          setWardsList(wardsList);
        }
      } catch {
        Toast.show({ type: "error", text1: "Không tải được dữ liệu" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const loadDistricts = (city) => {
    if (!city?.code) return setDistrictsList([]);
    const list = getDistricts(city.code);
    setDistrictsList(list);
  };

  const loadWards = (district) => {
    if (!district?.code) return setWardsList([]);
    const list = getWards(district.code);
    setWardsList(list);
  };

  const onSave = async () => {
    if (!form.street)
      return Toast.show({ type: "error", text1: "Nhập địa chỉ chi tiết" });
    if (!form.city)
      return Toast.show({ type: "error", text1: "Chọn Tỉnh / Thành phố" });

    const payload = {
      street: form.street.trim(),
      city: form.city,
      district: form.district,
      ward: form.ward,
      isDefault: form.isDefault,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateAddress(id, payload);
        Toast.show({ type: "success", text1: "Đã cập nhật địa chỉ" });
      } else {
        await createAddress(payload);
        Toast.show({ type: "success", text1: "Đã tạo địa chỉ mới" });
      }

      if (from === "cart") {
        router.replace("/checkout"); // Quay lại cart ngay, bỏ qua address list
      } else if (from === "order") {
        router.replace("/order/create/selectAddress");
      } else if (from === "newAddress") {
        router.replace("/addresses"); // Quay lại cart ngay, bỏ qua address list
      } else {
        router.back(); // hoặc router.replace("/addresses") nếu chỉ đang ở profile
      }

    } catch (err) {
      console.log("Error saving address:", err);
      Toast.show({
        type: "error",
        text1: isEdit ? "Không thể cập nhật" : "Không thể tạo địa chỉ",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderDropdown = (label, value, onChange, data, placeholder) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        data={data}
        labelField="name"
        valueField="code"
        placeholder={placeholder}
        value={value?.code || null}
        onChange={(item) => onChange(item)}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9F6EE" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => from === 'cart' ? router.push('/checkout') : router.back()} color="#333" />
        <Appbar.Content
          title={isEdit ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
          color="#333"
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.sectionTitle}>Thông tin địa chỉ</Text>
          <Divider style={styles.divider} />

          <TextInput
            label="Địa chỉ chi tiết"
            mode="outlined"
            value={form.street}
            onChangeText={(t) => setField("street", t)}
            style={styles.input}
          />

          {renderDropdown(
            "Tỉnh / Thành phố",
            form.city,
            (v) => {
              setField("city", v);
              loadDistricts(v);
              setField("district", null);
              setField("ward", null);
            },
            cities,
            "Chọn Tỉnh / Thành phố"
          )}

          {renderDropdown(
            "Quận / Huyện",
            form.district,
            (v) => {
              setField("district", v);
              loadWards(v);
              setField("ward", null);
            },
            districts,
            "Chọn Quận / Huyện"
          )}

          {renderDropdown(
            "Phường / Xã",
            form.ward,
            (v) => setField("ward", v),
            wards,
            "Chọn Phường / Xã"
          )}

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Đặt làm mặc định</Text>
            <Switch
              value={form.isDefault}
              onValueChange={(v) => setField("isDefault", v)}
              color="#A3C9A8"
            />
          </View>

          <Button
            mode="contained"
            onPress={onSave}
            loading={saving}
            style={styles.saveButton}
            labelStyle={styles.saveLabel}
          >
            {isEdit ? "Cập nhật địa chỉ" : "Tạo địa chỉ"}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#F9F6EE", elevation: 0, borderBottomWidth: 1, borderBottomColor: "#E0DAD0" },
  scroll: { padding: 16, backgroundColor: "#F9F6EE" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: "#EDEAE4" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#5B4636", marginBottom: 8 },
  divider: { backgroundColor: "#E6E0D4", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#6D5844", marginBottom: 6 },
  input: { backgroundColor: "#FFFFFF", borderRadius: 10, marginBottom: 16 },
  dropdown: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D7CCC8", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  placeholder: { color: "#9E9E9E", fontSize: 15 },
  selectedText: { color: "#5B4636", fontSize: 15, fontWeight: "500" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 24 },
  switchLabel: { color: "#5B4636", fontSize: 15, fontWeight: "500" },
  saveButton: { borderRadius: 10, backgroundColor: "#A3C9A8", paddingVertical: 10 },
  saveLabel: { color: "#5B4636", fontSize: 16, fontWeight: "600" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
