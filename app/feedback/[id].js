// TheTrois-App-FE/app/feedback/[id].js
// MÀN HÌNH CHÍNH CHO DANH SÁCH REVIEW

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import {
  getFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from '../../api/feedbackApi'; // FIX: đúng path tới src/api
import { AntDesign, Feather } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';

// MOCK AUTH STORE (thay bằng store thật khi có)
const useAuthStore = () => ({
  user: { id: '66b2b2b2b2b2b2b2b2b2b2b2', role: 'admin' },
  isAuthenticated: true,
});

// Theme
const PRIMARY_COLOR = '#0B8E5A';
const RATING_COLOR = '#FFA500';
const CARD_BG = '#FFFFFF';
const MUTED = '#6B7280';

// --- modal hook ---
const useAddEditFeedbackModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' | 'edit'
  const [currentData, setCurrentData] = useState(null);

  const openModal = (data = null) => {
    setCurrentData(data);
    setMode(data ? 'edit' : 'add');
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setCurrentData(null);
  };

  return { isVisible, mode, currentData, openModal, closeModal };
};

// Feedback form modal
const FeedbackFormModal = ({
  isVisible,
  onClose,
  onSubmit,
  mode,
  initialData,
  productId,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [content, setContent] = useState(initialData?.content || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setRating(initialData?.rating || 5);
      setContent(initialData?.content || '');
    }
  }, [initialData, isVisible]);

  const handleSubmit = async () => {
    if (!content.trim())
      return Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận.');
    setSubmitting(true);
    try {
      const payload = { rating, content };
      if (mode === 'add') {
        await onSubmit({ ...payload, productId });
      } else {
        await onSubmit(initialData?.id || initialData?._id, payload);
      }
      onClose();
    } catch (e) {
      Alert.alert(
        'Lỗi',
        e?.response?.data?.message || 'Không thể lưu bình luận.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mode === 'add' ? 'Viết Bình Luận Mới' : 'Sửa Bình Luận'}
          </Text>

          <Rating
            startingValue={rating}
            onFinishRating={setRating}
            style={{ paddingVertical: 10, marginBottom: 10 }}
            imageSize={28}
          />

          <TextInput
            style={styles.input}
            placeholder="Nội dung bình luận"
            multiline
            numberOfLines={4}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <View style={styles.modalFooter}>
            <Button title="Hủy" onPress={onClose} color={MUTED} />
            <Button
              title={mode === 'add' ? 'Gửi Bình Luận' : 'Cập Nhật'}
              onPress={handleSubmit}
              color={PRIMARY_COLOR}
              disabled={submitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Rating filter (inline component)
const RatingFilter = ({ selectedRating, onSelect }) => {
  const buttons = [null, 5, 4, 3, 2, 1]; // null = all
  return (
    <View style={styles.filterContainer}>
      {buttons.map((r) => {
        const label = r ? `${r}★` : 'Tất cả';
        const selected = r === selectedRating;
        return (
          <TouchableOpacity
            key={String(r)}
            style={[styles.ratingButton, selected && styles.ratingSelected]}
            onPress={() => onSelect(selected ? null : r)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                selected ? styles.ratingText : { color: '#111' },
                { fontWeight: selected ? '700' : '600' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ListEmpty = ({ isLoading }) => {
  if (isLoading) {
    return (
      <View style={{ padding: 30 }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <AntDesign name="frowno" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTextLarge}>
        Chưa có bình luận nào cho sản phẩm này.
      </Text>
      <Text style={styles.emptySub}>
        Hãy là người đầu tiên để lại đánh giá!
      </Text>
    </View>
  );
};

const Avatar = ({ name }) => {
  const initials = (name || 'A')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
    </View>
  );
};

const FeedbackItem = React.memo(
  ({ item, currentUserId, isAdmin, onEdit, onDelete }) => {
    const ownerId = item?.userId?.id || item?.userId?._id || item?.userId;
    const isOwner = String(ownerId) === String(currentUserId);
    const canDelete = isOwner || isAdmin;
    const canEdit = isOwner;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.left}>
            <Avatar name={item.userId?.name} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>
                {item.userId?.name || 'Anonymous'}
              </Text>
              <Text style={styles.smallMuted}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            <View style={styles.ratingWrap}>
              <Text style={styles.ratingNumber}>{item.rating}</Text>
              <AntDesign name="star" size={14} color={RATING_COLOR} />
            </View>
            {item.isVerifiedPurchase && (
              <Text style={styles.verifiedBadge}>Đã mua</Text>
            )}
          </View>
        </View>

        <Text style={styles.content}>{item.content}</Text>

        <View style={styles.cardFooter}>
          {canEdit && (
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={styles.actionBtn}
            >
              <Feather name="edit-2" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.replyText}>Sửa</Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id || item._id)}
              style={styles.actionBtn}
            >
              <AntDesign name="delete" size={14} color="#EF4444" />
              <Text style={[styles.replyText, { color: '#EF4444' }]}>Xóa</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionBtn}>
            <AntDesign name="message1" size={14} color={PRIMARY_COLOR} />
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>

          {item.status === 'reported' && (
            <Text style={styles.reportedBadge}>Reported</Text>
          )}
        </View>
      </View>
    );
  }
);

const FeedbackListScreen = () => {
  const params = useLocalSearchParams();
  const productId = params.id || null;
  const productName = params.productName || 'Reviews';
  const router = useRouter();

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const isAdmin = user?.role === 'admin';

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const modal = useAddEditFeedbackModal();

  const fetchReviews = useCallback(
    async (isLoadMore = false, pageToLoad = 1) => {
      if (!productId) {
        setLoading(false);
        return;
      }

      if (loading && isLoadMore) return;

      setLoading(true);
      try {
        const filters = {
          productId,
          limit: 10,
          page: pageToLoad,
          rating: selectedRating,
        };
        const response = await getFeedbacks(filters);
        const { results, totalPages } = response?.data || {};
        const newResults = results || [];

        setFeedbacks((prev) =>
          isLoadMore ? [...prev, ...newResults] : newResults
        );
        setPage(pageToLoad + 1);
        setHasMore(pageToLoad < (totalPages || 1));
      } catch (e) {
        Alert.alert(
          'Error',
          e?.response?.data?.message || 'Failed to load reviews. Check backend.'
        );
      } finally {
        setLoading(false);
      }
    },
    [productId, selectedRating, loading]
  );

  useEffect(() => {
    setPage(1);
    setFeedbacks([]);
    setHasMore(true);
    fetchReviews(false, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRating, productId]);

  const handleLoadMore = () => {
    if (feedbacks.length === 0) return;
    if (!hasMore || loading) return;
    fetchReviews(true, page);
  };

  // CRUD handlers
  const handleCreateFeedback = async (data) => {
    try {
      await createFeedback(data);
      setPage(1);
      setFeedbacks([]);
      fetchReviews(false, 1);
      Alert.alert('Thành công', 'Bình luận của bạn đã được gửi thành công!');
    } catch (e) {
      throw e;
    }
  };

  const handleEditFeedback = async (id, data) => {
    try {
      await updateFeedback(id, data);
      setPage(1);
      setFeedbacks([]);
      fetchReviews(false, 1);
      Alert.alert('Thành công', 'Bình luận đã được cập nhật!');
    } catch (e) {
      throw e;
    }
  };

  const handleDeleteFeedback = (feedbackId) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa bình luận này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFeedback(feedbackId);
            setPage(1);
            setFeedbacks([]);
            fetchReviews(false, 1);
            Alert.alert('Thành công', 'Bình luận đã được xóa.');
          } catch (e) {
            Alert.alert(
              'Lỗi',
              e?.response?.data?.message || 'Không thể xóa bình luận.'
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Reviews for ${productName}`,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <AntDesign name="arrowleft" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <RatingFilter
        selectedRating={selectedRating}
        onSelect={setSelectedRating}
      />

      <FlatList
        data={feedbacks}
        renderItem={({ item }) => (
          <FeedbackItem
            item={item}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onEdit={modal.openModal}
            onDelete={handleDeleteFeedback}
          />
        )}
        keyExtractor={(item, index) => item.id || item._id || String(index)}
        contentContainerStyle={{ paddingBottom: 120 }}
        onEndReachedThreshold={0.6}
        onEndReached={handleLoadMore}
        ListEmptyComponent={() => <ListEmpty isLoading={loading} />}
        ListFooterComponent={() =>
          loading && feedbacks.length > 0 ? (
            <ActivityIndicator style={{ padding: 20 }} color={PRIMARY_COLOR} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {currentUserId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => modal.openModal(null)}
        >
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <FeedbackFormModal
        isVisible={modal.isVisible}
        onClose={modal.closeModal}
        onSubmit={
          modal.mode === 'add' ? handleCreateFeedback : handleEditFeedback
        }
        mode={modal.mode}
        initialData={modal.currentData}
        productId={productId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', marginTop: 50 },
  emptyContainer: { padding: 30, alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    minHeight: 88,
    backgroundColor: '#FAFAFB',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 25,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 28,
    elevation: 8,
    zIndex: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E6E9EE',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  ratingButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  ratingSelected: { backgroundColor: PRIMARY_COLOR },
  ratingText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: CARD_BG,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  right: { alignItems: 'flex-end' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  userName: { fontWeight: '700', fontSize: 14 },
  smallMuted: { color: MUTED, fontSize: 12 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center' },
  ratingNumber: { color: RATING_COLOR, fontWeight: '700', marginRight: 6 },
  verifiedBadge: {
    marginTop: 6,
    fontSize: 11,
    color: '#fff',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  reportedBadge: {
    marginLeft: 5,
    fontSize: 11,
    color: '#fff',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  content: { fontSize: 15, lineHeight: 22, color: '#111827', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  replyBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  replyText: { color: PRIMARY_COLOR, marginLeft: 6, fontWeight: '600' },
  emptyTextLarge: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
  },
  emptySub: { textAlign: 'center', color: MUTED, marginTop: 6 },
  pill: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: { color: '#fff', fontWeight: '700' },
});

export default FeedbackListScreen;
