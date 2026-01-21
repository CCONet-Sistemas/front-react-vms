import { useQuery } from '@tanstack/react-query';
import { userService } from '~/services/api';
import { useAuthStore } from '~/store/auth.store';
import { useEffect } from 'react';

export function useMe() {
  const { setUser, isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: userService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}
