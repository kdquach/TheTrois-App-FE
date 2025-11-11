import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
   Text,
   Surface,
   ActivityIndicator,
   Button,
   TextInput,
   Menu,
   IconButton,
   Portal,
   Dialog,
   Avatar,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from 'react-native-paper';
import StarRating from '../../components/StarRating';
import RatingDistribution from '../../components/RatingDistribution';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FeedbackListScreen() {
   const theme = useTheme();
   const { productId } = useLocalSearchParams();
   const { products } = useProductStore();
   // Palette giống phần địa chỉ
   const palette = {
      background: '#FAF9F6',
      card: '#FFFFFF',
      accent: '#A3C9A8',
      beige: '#E9E3D5',
      textPrimary: '#3E3B32',
      textSecondary: '#6B675F',
      danger: '#D9534F',
   };
   const {
      fetchFeedbacks,
      list,
      loading,
      stats,
      fetchReplies,
      replies,
      updateFeedback,
      deleteFeedback,
      addReply,
      updateReply,
      deleteReply,
   } = useFeedbackStore();
   const { user } = useAuthStore();

   // UI state (filters removed as requested)
   const [sortLatest] = useState(true);

   // Menus/dialogs state for edit/delete
   const [menuOpenFor, setMenuOpenFor] = useState(null); // feedbackId
   const [editFb, setEditFb] = useState(null); // feedback object
   const [editRating, setEditRating] = useState(0);
   const [editContent, setEditContent] = useState('');
   const [confirmDelete, setConfirmDelete] = useState(null); // feedbackId

   // Reply compose/edit state
   const [replyTexts, setReplyTexts] = useState({}); // fid -> text
   const [editingReply, setEditingReply] = useState(null); // { fid, reply }
   const [editingReplyText, setEditingReplyText] = useState('');
   const [confirmDeleteReply, setConfirmDeleteReply] = useState(null); // { fid, rid }

   useEffect(() => {
      if (productId) {
         fetchFeedbacks({ productId });
      }
   }, [productId]);

   // Auto-fetch replies for each feedback so they appear without sending a new reply
   useEffect(() => {
      if (!list || list.length === 0) return;
      list.forEach((fb) => {
         const fid = fb?.id || fb?._id;
         if (fid && !replies[fid]) {
            fetchReplies(fid);
         }
      });
   }, [list, replies]);

   const handleOpenCreate = () => {
      // Chỉ cho phép đánh giá từ đơn hàng đã mua: điều hướng về Orders (Hoàn thành)
      Toast.show({ type: 'info', text1: 'Hãy đánh giá từ đơn hàng đã mua' });
      try { router.push('/(tabs)/orders'); } catch (e) { }
   };

   const filteredList = useMemo(() => {
      let arr = [...list];
      if (sortLatest) arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return arr;
   }, [list, sortLatest]);

   const isOwner = (fb) => {
      const uid = user?.id || user?._id;
      const fid = fb?.userId?.id || fb?.userId?._id || fb?.userId;
      return uid && fid && String(uid) === String(fid);
   };

   const openEdit = (fb) => {
      setEditFb(fb);
      setEditRating(Number(fb.rating) || 0);
      setEditContent(fb.content || '');
      setMenuOpenFor(null);
   };

   const saveEdit = async () => {
      if (!editFb) return;
      try {
         await updateFeedback(editFb.id || editFb._id, { rating: editRating, content: editContent });
         Toast.show({ type: 'success', text1: 'Đã cập nhật đánh giá' });
         setEditFb(null);
      } catch (e) { }
   };

   const confirmDeleteFb = (fid) => {
      setConfirmDelete(fid);
      setMenuOpenFor(null);
   };

   const doDelete = async () => {
      if (!confirmDelete) return;
      try {
         await deleteFeedback(confirmDelete);
         Toast.show({ type: 'success', text1: 'Đã xóa đánh giá' });
      } finally { setConfirmDelete(null); }
   };

   const onSendReply = async (fid) => {
      const text = (replyTexts[fid] || '').trim();
      if (!text) return;
      try {
         await addReply(fid, { content: text });
         setReplyTexts((s) => ({ ...s, [fid]: '' }));
         fetchReplies(fid);
         Toast.show({ type: 'success', text1: 'Đã gửi phản hồi' });
      } catch (e) { }
   };

   const onStartEditReply = (fid, r) => {
      setEditingReply({ fid, reply: r });
      setEditingReplyText(r.content || '');
   };

   const onSaveEditReply = async () => {
      if (!editingReply) return;
      try {
         await updateReply(editingReply.fid, editingReply.reply.id || editingReply.reply._id, { content: editingReplyText });
         setEditingReply(null);
         setEditingReplyText('');
         Toast.show({ type: 'success', text1: 'Đã cập nhật phản hồi' });
      } catch (e) { }
   };

   const onDeleteReply = async (fid, rid) => {
      try {
         await deleteReply(fid, rid);
         Toast.show({ type: 'success', text1: 'Đã xóa phản hồi' });
         fetchReplies(fid);
      } catch (e) { }
   };

   // Derive product name for header
   const product = (useProductStore && useProductStore.getState ? useProductStore.getState().products : [])
      ?.find((p) => (p.id || p._id) === productId || String(p.id || p._id) === String(productId));
   const productName = product?.name || 'Sản phẩm';

   return (
      <View style={{ flex: 1 }}>
         <Surface style={styles.fixedHeader} elevation={0}>
            <IconButton icon="arrow-left" size={22} onPress={() => router.back()} style={styles.headerBack} />
            <Text numberOfLines={1} style={styles.headerTitle}>{productName}</Text>
         </Surface>
         <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
            <Text variant="titleLarge" style={styles.pageTitle}>Đánh giá & nhận xét</Text>

         <Surface style={styles.summaryCard} elevation={0}>
            <View style={styles.summaryRow}>
               {/* Cột trái: điểm trung bình + sao + số lượng đánh giá */}
               <View style={styles.leftCol}>
                  <Text style={styles.average}>{stats.average?.toFixed(1) || '0.0'}</Text>
                  <StarRating value={Math.round(stats.average)} editable={false} size={18} />
                  <Text style={styles.reviewCount}>{stats.count || 0} đánh giá</Text>
               </View>

               {/* Cột phải: thanh phân bố sao */}
               <View style={styles.rightCol}>
                  <RatingDistribution
                     distribution={stats.distribution}
                     count={stats.count}
                     segments={4}
                     activeColor={theme.colors.starbucksGreen || '#2E7D32'}
                     inactiveColor="#DDD"
                     showRightCount={false}
                  />
               </View>
            </View>
         </Surface>

         {loading && list.length === 0 && (
            <ActivityIndicator style={{ marginTop: 20 }} />
         )}

         {filteredList.map((fb) => {
            const fid = fb.id || fb._id;
            const replyList = replies[fid] || [];
            const userName = fb.userId?.name || 'Người dùng';
            const avatarUrl = fb.userId?.avatarUrl || fb.userId?.avatar || null;
            const firstLetter = userName.charAt(0).toUpperCase();
            return (
               <Surface key={fid} style={styles.feedbackCard} elevation={0}>
                  {/* Row 1: avatar + name + menu */}
                  <View style={styles.row1}>
                     {avatarUrl ? <Avatar.Image size={36} source={{ uri: avatarUrl }} /> : <Avatar.Text size={36} label={firstLetter} />}
                     <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.userName}>{userName}</Text>
                     </View>
                     {isOwner(fb) && (
                        <Menu
                           visible={menuOpenFor === fid}
                           onDismiss={() => setMenuOpenFor(null)}
                           anchor={<IconButton icon="dots-vertical" onPress={() => setMenuOpenFor(fid)} size={20} />}
                        >
                           <Menu.Item onPress={() => openEdit(fb)} title="Sửa" leadingIcon="pencil" />
                           <Menu.Item onPress={() => confirmDeleteFb(fid)} title="Xóa" leadingIcon="delete" />
                        </Menu>
                     )}
                  </View>
                  {/* Row 2: stars + relative time */}
                  <View style={styles.row2}>
                     <StarRating value={fb.rating} size={16} editable={false} />
                  </View>
                  {/* Row 3: content */}
                  {!!fb.content && <Text style={styles.content}>{fb.content}</Text>}
                  {/* Staff/Admin replies */}
                  <View style={{ marginTop: 6 }}>
                     {replyList.filter(r => r.isStaffReply).map(r => {
                        const rid = r.id || r._id;
                        const rUserName = (r.userId?.name) || 'Cửa hàng';
                        const rAvatar = r.userId?.avatar || r.userId?.avatarUrl || null;
                        const canEditStaff = user && ((r.userId?.id || r.userId?._id || r.userId) && String(r.userId?.id || r.userId?._id || r.userId) === String(user.id || user._id) || (user.role === 'admin' && r.isStaffReply));
                        return (
                           <View key={rid} style={styles.staffReplyBubble}>
                              <View style={styles.staffReplyHeader}>
                                 {rAvatar ? <Avatar.Image size={24} source={{ uri: rAvatar }} /> : <Avatar.Text size={24} label={(rUserName || 'S')[0]} />}
                                 <Text style={styles.staffReplyLabel}>{rUserName}</Text>
                                 {canEditStaff && (
                                    <Menu
                                       visible={menuOpenFor === `sr-${rid}`}
                                       onDismiss={() => setMenuOpenFor(null)}
                                       anchor={<IconButton icon="dots-vertical" size={18} onPress={() => setMenuOpenFor(`sr-${rid}`)} />}
                                    >
                                       <Menu.Item onPress={() => onStartEditReply(fid, r)} title="Sửa" leadingIcon="pencil" />
                                       <Menu.Item onPress={() => { setMenuOpenFor(null); setConfirmDeleteReply({ fid, rid }); }} title="Xóa" leadingIcon="delete" />
                                    </Menu>
                                 )}
                              </View>
                              <Text style={styles.staffReplyContent}>{r.content}</Text>
                           </View>
                        );
                     })}
                  </View>

                  {/* Replies */}
                  <View style={{ marginTop: 8 }}>
                     {replyList.filter(r => !r.isStaffReply).map((r) => {
                        const rid = r.id || r._id;
                        const canEdit = user && ((r.userId?.id || r.userId?._id || r.userId) && String(r.userId?.id || r.userId?._id || r.userId) === String(user.id || user._id));
                        return (
                           <View key={rid} style={styles.replyRow}>
                              <View style={styles.replyHeader}>
                                 {r.userId?.avatar ? (
                                    <Avatar.Image size={28} source={{ uri: r.userId.avatar }} />
                                 ) : (
                                    <Avatar.Text size={28} label={(r.userId?.name || 'U').charAt(0).toUpperCase()} />
                                 )}
                                 <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.replyAuthor}>{r.userId?.name || 'Reply'}</Text>
                                 </View>
                                 {canEdit && (
                                    <Menu
                                       visible={menuOpenFor === `r-${rid}`}
                                       onDismiss={() => setMenuOpenFor(null)}
                                       anchor={<IconButton icon="dots-vertical" size={18} onPress={() => setMenuOpenFor(`r-${rid}`)} />}
                                    >
                                       <Menu.Item onPress={() => onStartEditReply(fid, r)} title="Sửa" leadingIcon="pencil" />
                                       <Menu.Item onPress={() => { setMenuOpenFor(null); setConfirmDeleteReply({ fid, rid }); }} title="Xóa" leadingIcon="delete" />
                                    </Menu>
                                 )}
                              </View>
                              <Text style={styles.replyContent}>{r.content}</Text>
                           </View>
                        );
                     })}

                     {/* Auto-load replies via fetchReplies(fid) elsewhere; button hidden for cleaner UI */}

                     {/* Reply composer: only owner can reply to their own feedback theo yêu cầu */}
                     {isOwner(fb) && (
                        <View style={{ marginTop: 6 }}>
                           <TextInput
                              mode="outlined"
                              placeholder="Phản hồi của bạn..."
                              value={replyTexts[fid] || ''}
                              onChangeText={(t) => setReplyTexts((s) => ({ ...s, [fid]: t }))}
                           />
                           <View style={{ alignItems: 'flex-end' }}>
                              <Button mode="contained-tonal" compact onPress={() => onSendReply(fid)} style={{ marginTop: 6 }}>Gửi phản hồi</Button>
                           </View>
                        </View>
                     )}
                  </View>
               </Surface>
            );
         })}

         {/* Edit feedback dialog */}
         <Portal>
            {/* Edit feedback */}
            <Dialog
               visible={!!editFb}
               onDismiss={() => setEditFb(null)}
               style={{ borderRadius: 12, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.beige }}
            >
               <Dialog.Title style={{ color: palette.textPrimary, fontWeight: '700' }}>Sửa đánh giá</Dialog.Title>
               <Dialog.Content>
                  <StarRating value={editRating} onChange={setEditRating} size={28} />
                  <TextInput
                     mode="outlined"
                     value={editContent}
                     onChangeText={setEditContent}
                     multiline
                     style={{ marginTop: 12, backgroundColor: '#FFF' }}
                     outlineStyle={{ borderColor: palette.beige }}
                     textColor={palette.textPrimary}
                  />
               </Dialog.Content>
               <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                  <Button onPress={() => setEditFb(null)} textColor={palette.textSecondary}>Hủy</Button>
                  <Button
                     mode="contained"
                     onPress={saveEdit}
                     buttonColor={palette.accent}
                     textColor={palette.textPrimary}
                     style={{ borderRadius: 8 }}
                  >Lưu</Button>
               </Dialog.Actions>
            </Dialog>

            {/* Confirm delete feedback */}
            <Dialog
               visible={!!confirmDelete}
               onDismiss={() => setConfirmDelete(null)}
               style={{ borderRadius: 12, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.beige }}
            >
               <Dialog.Title style={{ color: palette.textPrimary, fontWeight: '700' }}>Xóa đánh giá?</Dialog.Title>
               <Dialog.Content>
                  <Text style={{ color: palette.textSecondary }}>Bạn có chắc chắn muốn xóa đánh giá này?</Text>
               </Dialog.Content>
               <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                  <Button onPress={() => setConfirmDelete(null)} textColor={palette.textSecondary}>Hủy</Button>
                  <Button onPress={doDelete} textColor={palette.danger}>Xóa</Button>
               </Dialog.Actions>
            </Dialog>

            {/* Edit reply */}
            <Dialog
               visible={!!editingReply}
               onDismiss={() => setEditingReply(null)}
               style={{ borderRadius: 12, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.beige }}
            >
               <Dialog.Title style={{ color: palette.textPrimary, fontWeight: '700' }}>Sửa phản hồi</Dialog.Title>
               <Dialog.Content>
                  <TextInput
                     mode="outlined"
                     value={editingReplyText}
                     onChangeText={setEditingReplyText}
                     multiline
                     style={{ backgroundColor: '#FFF' }}
                     outlineStyle={{ borderColor: palette.beige }}
                     textColor={palette.textPrimary}
                  />
               </Dialog.Content>
               <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                  <Button onPress={() => setEditingReply(null)} textColor={palette.textSecondary}>Hủy</Button>
                  <Button
                     mode="contained"
                     onPress={onSaveEditReply}
                     buttonColor={palette.accent}
                     textColor={palette.textPrimary}
                     style={{ borderRadius: 8 }}
                  >Lưu</Button>
               </Dialog.Actions>
            </Dialog>

            {/* Confirm delete reply */}
            <Dialog
               visible={!!confirmDeleteReply}
               onDismiss={() => setConfirmDeleteReply(null)}
               style={{ borderRadius: 12, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.beige }}
            >
               <Dialog.Title style={{ color: palette.textPrimary, fontWeight: '700' }}>Xóa phản hồi?</Dialog.Title>
               <Dialog.Content>
                  <Text style={{ color: palette.textSecondary }}>Bạn có chắc chắn muốn xóa phản hồi này?</Text>
               </Dialog.Content>
               <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                  <Button onPress={() => setConfirmDeleteReply(null)} textColor={palette.textSecondary}>Hủy</Button>
                  <Button
                     onPress={() => {
                        const ctx = confirmDeleteReply;
                        setConfirmDeleteReply(null);
                        if (ctx?.fid && ctx?.rid) onDeleteReply(ctx.fid, ctx.rid);
                     }}
                     textColor={palette.danger}
                  >Xóa</Button>
               </Dialog.Actions>
            </Dialog>
         </Portal>
      </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   fixedHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff', zIndex: 20, borderBottomWidth: 1, borderColor: '#eee' },
   headerBack: { marginRight: 4 },
   headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
   scrollContent: { padding: 16, paddingTop: 70 },
   pageTitle: { fontWeight: 'bold', marginBottom: 12 },
   summaryCard: { padding: 16, borderRadius: 12, marginBottom: 16, backgroundColor: '#fff' },
   summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
   leftCol: { width: '42%', alignItems: 'center', justifyContent: 'center' },
   rightCol: { width: '55%' },
   average: { fontWeight: '700', fontSize: 32 },
   feedbackCard: { padding: 16, borderRadius: 12, marginBottom: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
   row1: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
   userName: { fontWeight: '600', fontSize: 14 },
   row2: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
   relativeTime: { fontSize: 12, color: '#666' },
   content: { marginTop: 0, lineHeight: 20, fontSize: 14 },
   replyRow: { marginTop: 6, paddingLeft: 12, borderLeftWidth: 2, borderColor: '#ddd' },
   replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
   replyAuthor: { fontWeight: '600' },
   replyContent: {},
   verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4caf50', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
   verifiedText: { color: '#fff', marginLeft: 4, fontSize: 12, fontWeight: '600' },
   chip: { marginRight: 8, marginBottom: 8 },
   summaryCard: {
      padding: 20,
      borderRadius: 12,
      marginBottom: 16,
      alignItems: 'center',
      backgroundColor: '#fff',
   },
   summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
   },
   leftCol: {
      width: '35%',
      alignItems: 'center',
      justifyContent: 'center',
   },
   staffReplyBubble: { backgroundColor: '#f7f7f7', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginTop: 6 },
   staffReplyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
   staffReplyLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, color: '#444' },
   staffReplyContent: { fontSize: 13, lineHeight: 18, color: '#333' },
   reviewCount: {
      marginTop: 6,
      fontSize: 14,
      color: '#777',
   },
   rightCol: {
      width: '60%',
      paddingLeft: 8,
   },

});