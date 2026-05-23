import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor – attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor – handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { usernameOrEmail: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/users/me'),
};

// ── Post endpoints ────────────────────────────────────────────────────────────
export const postApi = {
  getFeed: (page = 0, size = 20, sort = 'hot') =>
    api.get(`/posts?page=${page}&size=${size}&sort=${sort}`),
  getPost: (id: number) => api.get(`/posts/${id}`),
  createPost: (data: object) => api.post('/posts', data),
  vote: (id: number, type: 'UPVOTE' | 'DOWNVOTE') =>
    api.post(`/posts/${id}/vote?type=${type}`),
  recordView: (id: number) => api.post(`/posts/${id}/view`),
  getTrending: () => api.get('/posts/trending'),
  getCommunityPosts: (communityName: string, page = 0, sort = 'hot') =>
    api.get(`/posts?community=${communityName}&page=${page}&sort=${sort}`),
  savePost: (id: number) => api.post(`/posts/${id}/save`),
  search: (q: string, page = 0) => api.get(`/posts/search?q=${q}&page=${page}`),
};

// ── Community endpoints ───────────────────────────────────────────────────────
export const communityApi = {
  getAll: (page = 0) => api.get(`/communities?page=${page}`),
  get: (id: number) => api.get(`/communities/${id}`),
  getByName: (name: string) => api.get(`/communities/name/${name}`),
  create: (data: object) => api.post('/communities', data),
  joinOrLeave: (id: number) => api.post(`/communities/${id}/join`),
  search: (q: string) => api.get(`/communities/search?q=${q}`),
};

// ── Comment endpoints ─────────────────────────────────────────────────────────
export const commentApi = {
  getByPost: (postId: number) => api.get(`/comments/post/${postId}`),
  create: (postId: number, data: { content: string; parentId?: number }) =>
    api.post(`/comments/post/${postId}`, data),
  vote: (id: number, type: 'UPVOTE' | 'DOWNVOTE') =>
    api.post(`/comments/${id}/vote?type=${type}`),
  delete: (id: number) => api.delete(`/comments/${id}`),
};

// ── AI endpoints ──────────────────────────────────────────────────────────────
export const aiApi = {
  summarize: (text: string) => api.post('/ai/summarize', { text }),
  moderate: (text: string) => api.post('/ai/moderate', { text }),
  chat: (message: string, context?: string) =>
    api.post('/ai/chat', { message, context }),
  sentiment: (text: string) => api.post('/ai/sentiment', { text }),
};

// ── Notification endpoints ────────────────────────────────────────────────────
export const notifApi = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ── Award endpoints ───────────────────────────────────────────────────────────
export const awardApi = {
  give: (postId: number, awardType: string) =>
    api.post(`/awards`, { postId, awardType }),
};
