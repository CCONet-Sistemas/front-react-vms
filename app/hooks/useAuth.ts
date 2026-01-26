import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '~/store';
import { apiClient } from '~/services/api';
import type { LoginDto, LoginResponse } from '~/types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();
  const login = useCallback(
    async (credentials: LoginDto) => {
      const response = await apiClient.post<LoginResponse>('/authentication', credentials);
      const tokens = response.data;

      console.log('Login response tokens:', tokens);

      // Buscar dados do usuário
      const userResponse = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      });
      const user = userResponse.data;

      console.log('User data:', user);
      storeLogin(user, tokens.accessToken);

      // Verificar se foi setado
      const state = useAuthStore.getState();
      console.log('Auth store after login:', {
        user: state.user,
        isAuthenticated: state.isAuthenticated
      });

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
