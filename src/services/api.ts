/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BASE_URL = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)
  : API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login.html';
    }
    return Promise.reject(error);
  }
);

export const logout = async () => {
  await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  localStorage.clear();
  window.location.href = '/login.html';
};

export const isAuthenticated = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  return res.ok;
};

export const getSSEUrl = (endpoint: string) => `${BASE_URL}${endpoint}`;

export default api;