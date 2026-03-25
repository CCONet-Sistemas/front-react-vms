import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '~/store';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Este registro já existe.',
  422: 'Dados inválidos. Verifique as informações e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Serviço indisponível. Tente novamente mais tarde.',
  503: 'Serviço temporariamente indisponível.',
};

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
  // Limpa interceptors existentes antes de registrar (evita duplicação com HMR)
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();

  // Request interceptor - add Authorization header
  apiClient.interceptors.request.use(
    (config) => {
      const accessToken = useAuthStore.getState().accessToken;
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

      // Exibe toast para todos os outros erros (exceto 401 que é tratado acima)
      const status = error.response?.status;
      const silent = error.config?._silentError;

      if (status && status !== 401 && !silent) {
        const apiMessage = error.response?.data?.message;
        const raw = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
        const message =
          typeof raw === 'string' && raw
            ? raw
            : (STATUS_MESSAGES[status] ?? 'Ocorreu um erro inesperado.');

        if (status >= 500) {
          toast.error(message);
        } else {
          toast.warning(message);
        }
      }

      return Promise.reject(error);
    }
  );
}
