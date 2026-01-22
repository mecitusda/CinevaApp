import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      // backend returns { user }
      return data.user;
    },
    retry: false,
    staleTime: 50 * 60 * 1000, // 50 dakika (signed URL 1 saat geçerli)
    gcTime: 1 * 60 * 60 * 1000, // 1 saat
  });
}
