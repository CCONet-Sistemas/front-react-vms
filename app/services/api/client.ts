import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true, // Envia cookies automaticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
