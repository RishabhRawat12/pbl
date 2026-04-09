import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
};

export const codeAPI = {
  saveSnippet: (snippetData) => api.post('/code/save', snippetData),
  getHistory: () => api.get('/code/history'),
  getSnippet: (id) => api.get(`/code/${id}`),
  updateSnippet: (id, snippetData) => api.put(`/code/${id}`, snippetData),
  deleteSnippet: (id) => api.delete(`/code/${id}`),
};

export default api;