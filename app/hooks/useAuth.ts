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
      const { user, tokens } = response.data;
      storeLogin(user, tokens.accessToken);
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
