import { create } from 'zustand';
import * as feedbackApi from '../api/feedbackApi';

// Compute distribution and average from list
const computeStats = (list = []) => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  list.forEach((f) => {
    const r = Math.max(1, Math.min(5, Number(f.rating) || 0));
    dist[r] += 1;
    total += r;
  });
  const count = list.length || 0;
  const average = count ? +(total / count).toFixed(1) : 0;
  return { average, count, distribution: dist };
};

export const useFeedbackStore = create((set, get) => ({
  list: [],
  replies: {}, // key: feedbackId -> replies array
  loading: false,
  stats: { average: 0, count: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } },

  // Fetch feedbacks, filtered by productId, rating, status
  fetchFeedbacks: async (params = {}) => {
    set({ loading: true });
    try {
      const data = await feedbackApi.getFeedbacks(params);
      // API may return { results, page, limit } or array
      const list = Array.isArray(data) ? data : (data.results || data.data || []);
      const stats = computeStats(list);
      set({ list, stats, loading: false });
      return list;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  createFeedback: async (payload) => {
    set({ loading: true });
    try {
      const created = await feedbackApi.createFeedback(payload);
      const { list } = get();
      const newList = [created, ...list];
      set({ list: newList, stats: computeStats(newList), loading: false });
      return created;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  updateFeedback: async (feedbackId, body) => {
    const updated = await feedbackApi.updateFeedback(feedbackId, body);
    const { list } = get();
    const newList = list.map((f) => (f.id === feedbackId || f._id === feedbackId ? updated : f));
    set({ list: newList, stats: computeStats(newList) });
    return updated;
  },

  deleteFeedback: async (feedbackId) => {
    await feedbackApi.deleteFeedback(feedbackId);
    const { list } = get();
    const newList = list.filter((f) => (f.id || f._id) !== feedbackId);
    set({ list: newList, stats: computeStats(newList) });
  },

  // Replies
  fetchReplies: async (feedbackId, params = {}) => {
    const data = await feedbackApi.getReplies(feedbackId, params);
    const list = Array.isArray(data) ? data : (data.results || data.data || []);
    console.log('[fetchReplies] feedbackId:', feedbackId, 'count:', list.length);
    if (list.length) {
      console.log('[fetchReplies] first reply sample:', list[0]);
    }
    set((state) => ({ replies: { ...state.replies, [feedbackId]: list } }));
    return list;
  },

  addReply: async (feedbackId, body) => {
    const created = await feedbackApi.addReply(feedbackId, body);
    const current = get().replies[feedbackId] || [];
    set((state) => ({ replies: { ...state.replies, [feedbackId]: [created, ...current] } }));
    return created;
  },

  updateReply: async (feedbackId, replyId, body) => {
    const updated = await feedbackApi.updateReply(feedbackId, replyId, body);
    const current = get().replies[feedbackId] || [];
    const newList = current.map((r) => (r.id === replyId || r._id === replyId ? updated : r));
    set((state) => ({ replies: { ...state.replies, [feedbackId]: newList } }));
    return updated;
  },

  deleteReply: async (feedbackId, replyId) => {
    await feedbackApi.deleteReply(replyId);
    const current = get().replies[feedbackId] || [];
    const newList = current.filter((r) => (r.id || r._id) !== replyId);
    set((state) => ({ replies: { ...state.replies, [feedbackId]: newList } }));
  },
}));
