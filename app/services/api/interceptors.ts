import { apiClient } from './client';
import { useAuthStore } from '~/store';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export function setupInterceptors() {
  // Response interceptor - handle 401 errors
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Se já está fazendo refresh, aguarda na fila
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiClient(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Tenta refresh - o cookie é enviado automaticamente
          await apiClient.post('/authentication/refresh');

          processQueue();
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          // Refresh falhou, faz logout
          useAuthStore.getState().logout();

          // Redireciona para login se não estiver lá
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
