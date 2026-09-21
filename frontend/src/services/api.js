/**
 * MPLAD Rakshak — API Service Layer
 * ===================================
 * Axios-based API client for all backend endpoints.
 */

import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ── Request Interceptor (Auth Token) ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mplad_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor (Error Handling) ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mplad_token');
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// Auth
// ═══════════════════════════════════════════════════════════

export const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  localStorage.setItem('mplad_token', res.data.access_token);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Projects
// ═══════════════════════════════════════════════════════════

export const getProjects = async (params = {}) => {
  const res = await api.get('/projects', { params });
  return res.data;
};

export const getProject = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

export const submitProject = async (projectData) => {
  const res = await api.post('/projects/submit', projectData);
  return res.data;
};

export const uploadPhoto = async (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/projects/${projectId}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const checkCompliance = async (text) => {
  const res = await api.post('/projects/compliance-check', { question: text });
  return res.data;
};

export const queryGuidelines = async (question) => {
  const res = await api.post('/projects/query-guidelines', { question });
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Audit & Anomalies
// ═══════════════════════════════════════════════════════════

export const getAnomalies = async (params = {}) => {
  const res = await api.get('/audit/anomalies', { params });
  return res.data;
};

export const updateAnomalyStatus = async (alertId, newStatus, notes = '') => {
  const res = await api.post(`/audit/anomalies/${alertId}/action`, {
    new_status: newStatus,
    resolution_notes: notes,
  });
  return res.data;
};

export const runAnomalySweep = async (params = {}) => {
  const res = await api.post('/audit/run-sweep', null, { params });
  return res.data;
};

export const getAnomalyStats = async () => {
  const res = await api.get('/audit/stats');
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════════════════════

export const getDashboardSummary = async (params = {}) => {
  const res = await api.get('/reports/summary', { params });
  return res.data;
};

export const getUtilizationByState = async () => {
  const res = await api.get('/reports/utilization-by-state');
  return res.data;
};

export const getProjectTimeline = async (months = 12) => {
  const res = await api.get('/reports/project-timeline', { params: { months } });
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Health & Data
// ═══════════════════════════════════════════════════════════

export const healthCheck = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const refreshData = async () => {
  const res = await api.get('/data/refresh');
  return res.data;
};

export default api;
