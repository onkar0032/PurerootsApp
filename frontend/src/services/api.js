import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// AUTH APIs
// ==========================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
};

// ==========================================
// MENU / JUICE APIs
// ==========================================
export const menuAPI = {
  getMenu: () => api.get('/menu'),
  getAllJuices: () => api.get('/menu/all'),
  getJuice: (id) => api.get(`/menu/${id}`),
  getByCategory: (category) => api.get(`/menu/category/${category}`),
  searchJuices: (query) => api.get(`/menu/search?q=${query}`),
  createJuice: (data) => api.post('/menu', data),
  updateJuice: (id, data) => api.put(`/menu/${id}`, data),
  deleteJuice: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/toggle`),
};

// ==========================================
// ORDER APIs
// ==========================================
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getAllOrders: () => api.get('/orders'),
  getActiveOrders: () => api.get('/orders/active'),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  getDashboardAnalytics: () => api.get('/orders/analytics/dashboard'),
};

// ==========================================
// FEEDBACK APIs
// ==========================================
export const feedbackAPI = {
  submitFeedback: (data) => api.post('/orders/feedback', data),
  getAllFeedback: () => api.get('/orders/feedback'),
};

export default api;
