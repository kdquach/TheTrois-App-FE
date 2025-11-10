import apiClient from './apiClient';

// Feedback CRUD
export const createFeedback = async ({ productId, rating, content }) => {
  if (!productId) throw new Error('Missing productId');
  const data = await apiClient.post('/feedbacks', { productId, rating, content });
  return data;
};

export const getFeedbacks = async (params = {}) => {
  const data = await apiClient.get('/feedbacks', { params });
  return data;
};

export const getFeedbackById = async (feedbackId) => {
  if (!feedbackId) throw new Error('Missing feedbackId');
  const data = await apiClient.get(`/feedbacks/${feedbackId}`);
  return data;
};

export const updateFeedback = async (feedbackId, body) => {
  if (!feedbackId) throw new Error('Missing feedbackId');
  const data = await apiClient.patch(`/feedbacks/${feedbackId}`, body);
  return data;
};

export const deleteFeedback = async (feedbackId) => {
  if (!feedbackId) throw new Error('Missing feedbackId');
  const data = await apiClient.delete(`/feedbacks/${feedbackId}`);
  return data;
};

// Feedback Replies CRUD
export const addReply = async (feedbackId, body) => {
  if (!feedbackId) throw new Error('Missing feedbackId');
  const data = await apiClient.post(`/feedbacks/${feedbackId}/replies`, body);
  return data;
};

export const getReplies = async (feedbackId, params = {}) => {
  if (!feedbackId) throw new Error('Missing feedbackId');
  const data = await apiClient.get(`/feedbacks/${feedbackId}/replies`, { params });
  return data;
};

export const updateReply = async (feedbackId, replyId, body) => {
  if (!feedbackId || !replyId) throw new Error('Missing feedbackId/replyId');
  const data = await apiClient.patch(`/feedbacks/${feedbackId}/replies/${replyId}`, body);
  return data;
};

export const deleteReply = async (replyId) => {
  if (!replyId) throw new Error('Missing replyId');
  const data = await apiClient.delete(`/feedbacks/replies/${replyId}`);
  return data;
};

export default {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  addReply,
  getReplies,
  updateReply,
  deleteReply,
};
