// TheTrois-App-FE/api/feedbackApi.js

import apiClient from './apiClient';

// --- FEEDBACKS ---

// UC: View List FeedBack (GET /v1/feedbacks)
export const getFeedbacks = (filters) => {
  // API này chấp nhận filters (productId, rating, limit, page)
  return apiClient.get('/feedbacks', { params: filters });
};

// UC: Add Feedback (POST /v1/feedbacks)
export const createFeedback = (data) => {
  // Lưu ý: User ID được lấy từ token (BE xử lý), FE chỉ gửi rating, content, productId
  return apiClient.post('/feedbacks', data);
};

// --- REPLIES ---

// UC: View List Feedback Reply (GET /v1/feedbacks/:feedbackId/replies)
export const getReplies = (feedbackId, filters) => {
  // Chúng ta sẽ tạo một endpoint GET mới để lấy replies
  return apiClient.get(`/feedbacks/${feedbackId}/replies`, { params: filters });
};

// UC: Add Reply (POST /v1/feedbacks/:feedbackId/replies)
export const createReply = (feedbackId, data) => {
  // Data chứa: content, parentId (nếu có)
  return apiClient.post(`/feedbacks/${feedbackId}/replies`, data);
};
