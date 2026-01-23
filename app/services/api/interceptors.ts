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

  // Request interceptor - add Authorization header
  apiClient.interceptors.request.use(
    (config) => {
      const accessToken = useAuthStore.getState().accessToken;
      console.log('Attaching access token to request:', accessToken);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

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
          const { data } = await apiClient.post<{ accessToken: string }>('/authentication/refresh');
          // Salva o novo accessToken

          useAuthStore.getState().setAccessToken(data.accessToken);
          console.log('Access token refreshed:', data.accessToken);
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
