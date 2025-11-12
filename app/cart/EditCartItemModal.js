import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Surface,
  IconButton,
  Divider,
  TextInput,
  Chip,
  Avatar,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
// Gradient removed per updated design
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';
import * as productApi from '../../api/productApi';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../../components/LoadingIndicator';

const { width, height } = Dimensions.get('window');

export default function EditCartItemModal({ visible, item, onDismiss }) {
  const theme = useTheme();
  const { updateCartItem } = useCartStore();
  const { products } = useProductStore();

  // State để quản lý các tùy chọn
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('S');
  const [iceLevel, setIceLevel] = useState(100);
  const [sugarLevel, setSugarLevel] = useState(100);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [note, setNote] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // State for toppings
  const [allToppings, setAllToppings] = useState([]);
  const [loadingToppings, setLoadingToppings] = useState(false);

  // Lấy product từ store để có đầy đủ thông tin
  const product = products.find(
    (p) => p.id === item?.productId || p._id === item?.productId
  );

  // Get topping IDs from product
  const productToppingIds = product?.toppings || [];

  // Filter toppings that belong to this product
  const productToppings = allToppings.filter((topping) => {
    const toppingId = topping.id || topping._id;
    return productToppingIds.includes(toppingId);
  });

  // Fetch all toppings from API
  useEffect(() => {
    const fetchToppings = async () => {
      if (!visible) return;

      setLoadingToppings(true);
      try {
        const data = await productApi.getToppings({ silentError: true });
        const toppingsList = Array.isArray(data)
          ? data
          : data?.results || data?.data || [];
        console.log('Fetched all toppings:', toppingsList);
        setAllToppings(toppingsList);
      } catch (error) {
        console.error('Error fetching toppings:', error);
        setAllToppings([]);
      } finally {
        setLoadingToppings(false);
      }
    };

    fetchToppings();
  }, [visible]);

  // Load dữ liệu item khi modal mở
  useEffect(() => {
    if (visible && item) {
      setQuantity(item.quantity || 1);
      setSelectedSize(item.customization?.size || 'S');
      setIceLevel(item.customization?.ice ?? 100);
      setSugarLevel(item.customization?.sugar ?? 100);
      setCustomDescription(item.customization?.description || '');
      setNote(item.note || '');

      // Load toppings đã chọn - chuyển về mảng ID
      const toppingIds = (item.toppings || []).map((t) => {
        // Xử lý cả trường hợp toppingId hoặc id hoặc _id
        return t.toppingId || t.id || t._id;
      });

      console.log('Loading selected topping IDs:', toppingIds);
      setSelectedToppings(toppingIds);
    }
  }, [visible, item, allToppings]);

  // Tính giá tạm thời khi đang chỉnh sửa
  const calculateTempPrice = () => {
    if (!item) return 0;

    let total = (item.unitPrice || 0) * quantity;

    // Giá size
    if (selectedSize === 'M') total += 5000 * quantity;
    else if (selectedSize === 'L') total += 10000 * quantity;

    // Giá toppings - tính từ productToppings
    selectedToppings.forEach((toppingId) => {
      const topping = productToppings.find(
        (t) => (t.id || t._id) === toppingId
      );
      if (topping) {
        total += topping.price * quantity;
      }
    });

    return total;
  };

  // Toggle topping - chỉ làm việc với ID
  const toggleTopping = (toppingId) => {
    const exists = selectedToppings.includes(toppingId);
    if (exists) {
      setSelectedToppings(selectedToppings.filter((id) => id !== toppingId));
    } else {
      setSelectedToppings([...selectedToppings, toppingId]);
    }
  };

  // Xử lý lưu
  const handleSave = async () => {
    const customization = {
      size: selectedSize,
      ice: iceLevel,
      sugar: sugarLevel,
      description: customDescription.trim() || undefined,
    };

    // FIX CỨNG: Đảm bảo toppingId luôn là string
    const toppings = selectedToppings
      .map((toppingId) => {
        // Xử lý trường hợp toppingId có thể là object hoặc nested object
        let finalToppingId = toppingId;

        // Nếu là object, lấy id từ bên trong
        if (typeof toppingId === 'object' && toppingId !== null) {
          finalToppingId = toppingId.id || toppingId._id || toppingId.toppingId;

          // Nếu vẫn là object (nested), tiếp tục lấy
          if (typeof finalToppingId === 'object' && finalToppingId !== null) {
            finalToppingId = finalToppingId.id || finalToppingId._id;
          }
        }

        // Đảm bảo convert thành string
        const toppingIdString = String(finalToppingId || '');

        console.log('Processing topping:', {
          original: toppingId,
          final: toppingIdString,
        });

        return {
          toppingId: toppingIdString,
          quantity: 1,
        };
      })
      .filter((t) => t.toppingId); // Loại bỏ topping không hợp lệ

    console.log('Updating cart item with:', {
      quantity,
      customization,
      toppings,
      note: note.trim(),
    });

    await updateCartItem(item.id, {
      quantity,
      customization,
      toppings,
      note: note.trim(),
    });

    Toast.show({
      type: 'success',
      text1: 'Đã cập nhật',
      text2: 'Sản phẩm trong giỏ hàng đã được cập nhật',
    });

    onDismiss();
  };

  if (!item) return null;

  const sizes = [
    { label: 'S', value: 'S', extra: 0 },
    { label: 'M', value: 'M', extra: 5000 },
    { label: 'L', value: 'L', extra: 10000 },
  ];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface} elevation={0}>
          {/* Header (solid color, no gradient/shadow) */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Avatar.Image
                  source={{
                    uri: item.image || 'https://via.placeholder.com/60',
                  }}
                  size={60}
                  style={styles.productImage}
                />
                <View style={styles.headerText}>
                  <Text variant="titleLarge" style={styles.productName}>
                    {item.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.unitPrice}>
                    {formatCurrency(item.unitPrice)} / ly
                  </Text>
                  <View style={styles.headerQuantityWrapper}>
                    <Surface style={styles.quantityContainer} elevation={0}>
                      <IconButton
                        icon="minus"
                        iconColor={theme.colors.onSurface}
                        size={16}
                        style={styles.quantityButton}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      />
                      <Text style={styles.quantityValue}>{quantity}</Text>
                      <IconButton
                        icon="plus"
                        iconColor={theme.colors.onSurface}
                        size={16}
                        style={styles.quantityButton}
                        onPress={() => setQuantity(quantity + 1)}
                      />
                    </Surface>
                  </View>
                </View>
              </View>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>
          {/* End header */}

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >

            {/* Size selector (two-row layout) */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Size</Text>
              <View style={styles.sizeRow}>
                {sizes.map((s) => {
                  const selected = selectedSize === s.value;
                  return (
                    <TouchableOpacity
                      key={s.value}
                      style={[
                        styles.sizeOption,
                        selected && styles.sizeOptionActive,
                      ]}
                      onPress={() => setSelectedSize(s.value)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.sizeLabel,
                          selected && styles.sizeLabelActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                      <Text
                        style={[
                          styles.sizeExtra,
                          selected && styles.sizeExtraActive,
                        ]}
                      >
                        {s.extra > 0 ? `+${formatCurrency(s.extra)}` : '+0₫'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Đá */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Lượng đá: {iceLevel}%
              </Text>
              <View style={styles.levelButtons}>
                {[0, 50, 75, 100].map((level) => (
                  <Chip
                    key={level}
                    selected={iceLevel === level}
                    onPress={() => setIceLevel(level)}
                    style={[
                      styles.levelChip,
                      { backgroundColor: '#eee' },
                      iceLevel === level && { backgroundColor: '#E8F5E9' },
                    ]}
                    textStyle={[
                      styles.chipText,
                      iceLevel === level && { color: theme.colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {level}%
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Toppings */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Topping
              </Text>
              {loadingToppings ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <LoadingIndicator
                    type="pulse"
                    size={40}
                    color={theme.colors.primary}
                    text="Đang tải topping..."
                  />
                </View>
              ) : productToppings.length > 0 ? (
                productToppings.map((topping) => {
                  const toppingId = topping.id || topping._id;
                  const selected = selectedToppings.includes(toppingId);

                  return (
                    <Surface
                      key={toppingId}
                      style={[
                        styles.toppingItem,
                        selected && styles.toppingItemSelected,
                      ]}
                      elevation={0}
                    >
                      <TouchableOpacity
                        style={styles.toppingContent}
                        onPress={() => toggleTopping(toppingId)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.toppingInfo}>
                          <View style={styles.toppingText}>
                            <Text
                              variant="bodyLarge"
                              style={selected ? styles.toppingNameActive : styles.toppingName}
                            >
                              {topping.name}
                            </Text>
                            <Text
                              variant="bodySmall"
                              style={selected ? styles.toppingPriceActive : styles.toppingPrice}
                            >
                              +{formatCurrency(topping.price)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Surface>
                  );
                })
              ) : (
                <Text
                  variant="bodyMedium"
                  style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}
                >
                  Sản phẩm này không có topping đi kèm
                </Text>
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Mô tả tùy chỉnh */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Mô tả tùy chỉnh (tùy chọn)
              </Text>
              <TextInput
                mode="outlined"
                placeholder="VD: Ít đá, nhiều trân châu..."
                value={customDescription}
                onChangeText={setCustomDescription}
                multiline
                numberOfLines={2}
                style={styles.textInput}
                maxLength={100}
              />
            </View>

            <Divider style={styles.divider} />

            {/* Ghi chú */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Ghi chú
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Ghi chú cho món này..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
                style={styles.textInput}
                maxLength={200}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <Surface style={styles.footer} elevation={0}>
            <View style={styles.footerContent}>
              <View style={styles.totalSection}>
                <Text variant="bodyLarge" style={styles.totalLabel}>
                  Tổng cộng
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.totalPrice,
                    { color: theme.colors.primary },
                  ]}
                >
                  {formatCurrency(calculateTempPrice())}
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                labelStyle={styles.saveButtonLabel}
              >
                Lưu thay đổi
              </Button>
            </View>
          </Surface>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSurface: {
    height: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    color: '#362415',
    fontSize: 14,
  },
  headerQuantityWrapper: {
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eeeeee',
    borderRadius: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityButton: {
    margin: 0,
    width: 14,
    height: 14,
  },
  quantityValue: {
    marginHorizontal: 8,
    minWidth: 14,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#362415',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeOption: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  sizeOptionActive: {
    backgroundColor: '#E8F5E9',
  },
  sizeLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: '#362415',
    marginBottom: 2,
  },
  sizeLabelActive: {
    color: '#00ac45',
    fontWeight: '700',
  },
  sizeExtra: {
    fontSize: 12,
    color: '#604c4c',
  },
  sizeExtraActive: {
    color: '#00ac45',
    fontWeight: '700',
  },
  chipText: {
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  levelChip: {
    flex: 1,
  },
  toppingItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  toppingItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  toppingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  toppingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toppingText: {
    marginLeft: 12,
    flex: 1,
  },
  toppingName: {
    color: '#362415',
  },
  toppingNameActive: {
    color: '#00ac45',
    fontWeight: '700',
  },
  toppingPrice: {
    color: '#604c4c',
    marginTop: 2,
  },
  toppingPriceActive: {
    color: '#00ac45',
    fontWeight: '700',
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerContent: {
    gap: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 8,
    borderRadius: 25,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
