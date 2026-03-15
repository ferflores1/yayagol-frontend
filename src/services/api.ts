/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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
  await fetch(`/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  window.location.href = '/login.html';
};

export default api;

export const isAuthenticated = async () => {
  const res = await fetch(`/api/auth/me`, {
    credentials: "include"
  });
  return res.ok;
};

export const getSSEUrl = (endpoint: string) => {
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${endpoint}`;
};