import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://habit-tracker-ut5q.onrender.com/api',
});

instance.interceptors.request.use((config) => {
  const stored = localStorage.getItem('habitflow_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

export default instance;
