import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '~/store';
import { apiClient } from '~/services/api';
import { wsManager } from '~/services/websocket';
import type { LoginDto, LoginResponse } from '~/types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();
  const login = useCallback(
    async (credentials: LoginDto) => {
      const response = await apiClient.post<LoginResponse>('/authentication', credentials);
      const tokens = response.data;


      // Buscar dados do usuário
      const userResponse = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      });
      const user = userResponse.data;

      storeLogin(user, tokens.accessToken);

      // Verificar se foi setado
      const state = useAuthStore.getState();


      navigate('/dashboard');
      return user;
    },
    [storeLogin, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/authentication/logout');
    } catch {
      // Ignore logout errors
    } finally {
      wsManager.disconnect();
      storeLogout();
      navigate('/login');
    }
  }, [storeLogout, navigate]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
