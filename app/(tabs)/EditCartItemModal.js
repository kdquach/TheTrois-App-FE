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
import { LinearGradient } from 'expo-linear-gradient';
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
        <Surface style={styles.modalSurface} elevation={5}>
          {/* Header */}
          <LinearGradient
            colors={[theme.colors.starbucksGreen, '#2E7D32']}
            style={styles.header}
          >
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
                </View>
              </View>
              <IconButton
                icon="close"
                iconColor="#FFFFFF"
                size={24}
                onPress={onDismiss}
                style={styles.closeButton}
              />
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Số lượng */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                🔢 Số lượng
              </Text>
              <Surface style={styles.quantityContainer} elevation={1}>
                <IconButton
                  icon="minus"
                  iconColor={theme.colors.starbucksGreen}
                  size={24}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                />
                <Text variant="headlineSmall" style={styles.quantityText}>
                  {quantity}
                </Text>
                <IconButton
                  icon="plus"
                  iconColor={theme.colors.starbucksGreen}
                  size={24}
                  onPress={() => setQuantity(quantity + 1)}
                />
              </Surface>
            </View>

            <Divider style={styles.divider} />

            {/* Size */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                📏 Kích cỡ
              </Text>
              <View style={styles.chipGroup}>
                {sizes.map((size) => (
                  <Chip
                    key={size.value}
                    selected={selectedSize === size.value}
                    onPress={() => setSelectedSize(size.value)}
                    style={[
                      styles.chip,
                      selectedSize === size.value && {
                        backgroundColor: theme.colors.starbucksGreen,
                      },
                    ]}
                    textStyle={[
                      styles.chipText,
                      selectedSize === size.value && styles.chipTextSelected,
                    ]}
                  >
                    {size.label}
                    {size.extra > 0 && ` (+${formatCurrency(size.extra)})`}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Đá */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                🧊 Lượng đá: {iceLevel}%
              </Text>
              <View style={styles.levelButtons}>
                {[0, 50, 75, 100].map((level) => (
                  <Chip
                    key={level}
                    selected={iceLevel === level}
                    onPress={() => setIceLevel(level)}
                    style={[
                      styles.levelChip,
                      iceLevel === level && {
                        backgroundColor: theme.colors.starbucksGreen,
                      },
                    ]}
                    textStyle={[
                      styles.chipText,
                      iceLevel === level && styles.chipTextSelected,
                    ]}
                  >
                    {level}%
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Đường */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                🍬 Lượng đường: {sugarLevel}%
              </Text>
              <View style={styles.levelButtons}>
                {[0, 50, 75, 100].map((level) => (
                  <Chip
                    key={level}
                    selected={sugarLevel === level}
                    onPress={() => setSugarLevel(level)}
                    style={[
                      styles.levelChip,
                      sugarLevel === level && {
                        backgroundColor: theme.colors.starbucksGreen,
                      },
                    ]}
                    textStyle={[
                      styles.chipText,
                      sugarLevel === level && styles.chipTextSelected,
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
                🧋 Topping
              </Text>
              {loadingToppings ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <LoadingIndicator
                    type="pulse"
                    size={40}
                    color={theme.colors.starbucksGreen}
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
                      elevation={1}
                    >
                      <TouchableOpacity
                        style={styles.toppingContent}
                        onPress={() => toggleTopping(toppingId)}
                      >
                        <View style={styles.toppingInfo}>
                          <MaterialCommunityIcons
                            name={
                              selected
                                ? 'checkbox-marked'
                                : 'checkbox-blank-outline'
                            }
                            size={24}
                            color={
                              selected
                                ? theme.colors.starbucksGreen
                                : theme.colors.onSurfaceVariant
                            }
                          />
                          <View style={styles.toppingText}>
                            <Text variant="bodyLarge">{topping.name}</Text>
                            <Text
                              variant="bodySmall"
                              style={styles.toppingPrice}
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
                ✏️ Mô tả tùy chỉnh (tùy chọn)
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
                📝 Ghi chú
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
          <Surface style={styles.footer} elevation={3}>
            <View style={styles.footerContent}>
              <View style={styles.totalSection}>
                <Text variant="bodyLarge" style={styles.totalLabel}>
                  Tổng cộng
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.totalPrice,
                    { color: theme.colors.starbucksGreen },
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
                  { backgroundColor: theme.colors.starbucksGreen },
                ]}
                labelStyle={styles.saveButtonLabel}
                icon="content-save"
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
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unitPrice: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    margin: 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1B5E20',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 50,
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  quantityText: {
    marginHorizontal: 24,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
  },
  chipText: {
    fontSize: 14,
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
    borderWidth: 2,
    borderColor: '#4CAF50',
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
  toppingPrice: {
    color: '#4CAF50',
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
  },
  divider: {
    marginVertical: 16,
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
