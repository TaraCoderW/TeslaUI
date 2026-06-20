import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://mlsa-mss-uemk-main.vercel.app';

// Public client
export const api = axios.create({ baseURL: BASE_URL });

// Admin client — auto-attaches admin token
export const adminApi = axios.create({ baseURL: BASE_URL });
adminApi.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mss_admin_token') || 'mss-admin-token-xyz-123';
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Member client — auto-attaches member session token
export const memberApi = axios.create({ baseURL: BASE_URL });
memberApi.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mss_member_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add robust error handling directly to the instances
const responseErrorHandler = (error: any) => {
  if (error.response && error.response.data && error.response.data.error) {
    return Promise.reject(new Error(error.response.data.error));
  }
  return Promise.reject(error);
};

api.interceptors.response.use(res => res, responseErrorHandler);
adminApi.interceptors.response.use(res => res, responseErrorHandler);
memberApi.interceptors.response.use(res => res, responseErrorHandler);

// ── Public endpoints ──────────────────────────────
export const getData = () => api.get('/api/data');
export const getSettings = () => api.get('/api/settings');
export const submitContact = (body: object) => api.post('/api/contact', body);
export const submitJoin = (body: object) => api.post('/api/join', body);
export const memberSignup = (body: object) => api.post('/api/member/signup', body);
export const requestOtp = (body: object) => api.post('/api/member/login/request-otp', body);
export const verifyOtp = (body: object) => api.post('/api/member/login/verify-otp', body);
export const sendAuthOtp = (email: string) => api.post('/api/auth/send-otp', { email });
export const verifyAuthOtp = (email: string, otp: string) => api.post('/api/auth/verify-otp', { email, otp });
export const googleAuth = (body: object) => api.post('/api/auth/google', body);
export const geminiChat = (message: string, history: any[]) => api.post('/api/gemini/chat', { message, history });

// ── Admin endpoints ───────────────────────────────
export const adminLogin = (email: string, password: string) => api.post('/api/login', { email, password });
export const getTasks = () => adminApi.get('/api/tasks');
export const createTask = (body: object) => adminApi.post('/api/tasks', body);
export const updateTask = (id: string, body: object) => adminApi.put(`/api/tasks/${id}`, body);
export const deleteTask = (id: string) => adminApi.delete(`/api/tasks/${id}`);
export const addTeamMember = (body: object) => adminApi.post('/api/team', body);
export const updateTeamMember = (id: string, body: object) => adminApi.put(`/api/team/${id}`, body);
export const deleteTeamMember = (id: string) => adminApi.delete(`/api/team/${id}`);
export const toggleBestMember = (id: string, val: boolean) => adminApi.put(`/api/team/${id}/best`, { isBestMember: val });
export const createEvent = (body: object) => adminApi.post('/api/events', body);
export const updateEvent = (id: string, body: object) => adminApi.put(`/api/events/${id}`, body);
export const deleteEvent = (id: string) => adminApi.delete(`/api/events/${id}`);
export const createGalleryItem = (body: object) => adminApi.post('/api/gallery', body);
export const updateGalleryItem = (id: string, body: object) => adminApi.put(`/api/gallery/${id}`, body);
export const deleteGalleryItem = (id: string) => adminApi.delete(`/api/gallery/${id}`);
export const createProject = (body: object) => adminApi.post('/api/projects', body);
export const updateProject = (id: string, body: object) => adminApi.put(`/api/projects/${id}`, body);
export const deleteProject = (id: string) => adminApi.delete(`/api/projects/${id}`);
export const updateSettings = (body: object) => adminApi.put('/api/settings', body);
export const deleteContact = (id: string) => adminApi.delete(`/api/contact/${id}`);
export const replyToContact = (id: string, replyText: string) => adminApi.post(`/api/contact/${id}/reply`, { replyText });
export const deleteJoinRequest = (id: string) => adminApi.delete(`/api/join/${id}`);
export const scheduleInterview = (id: string, body: object) => adminApi.post(`/api/join/${id}/schedule-interview`, body);
export const decideApplicant = (id: string, decision: 'selected' | 'rejected') => adminApi.post(`/api/join/${id}/decide`, { decision });
export const approvePending = (id: string) => adminApi.post(`/api/pending-members/${id}/approve`);
export const rejectPending = (id: string) => adminApi.delete(`/api/pending-members/${id}/reject`);
export const getNotifications = () => adminApi.get('/api/admin/notifications');
export const clearNotifications = () => adminApi.delete('/api/admin/notifications');

// ── Member endpoints ──────────────────────────────
export const updateMemberProfile = (body: object) => memberApi.put('/api/member/profile', body);
