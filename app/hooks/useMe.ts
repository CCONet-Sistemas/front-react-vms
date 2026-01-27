import { useQuery } from '@tanstack/react-query';
import { userService } from '~/services/api';
import { useAuthStore } from '~/store/auth.store';
import { useEffect, useRef } from 'react';

export function useMe() {
  const { setUser, isAuthenticated } = useAuthStore();
  const setUserRef = useRef(setUser);

  // Mantém a referência atualizada
  useEffect(() => {
    setUserRef.current = setUser;
  }, [setUser]);

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: userService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setUserRef.current(query.data);

      // Verificar se foi setado
      const state = useAuthStore.getState();

    }
  }, [query.data]);

  return query;
}
