import { useQuery } from '@tanstack/react-query';
import { getHome } from '../../api/home.api';
import { Movie} from '../../types/movie';
import { RecommendedRow } from '../../types/RecommendedRow';
import { useMeQuery } from '../auth/useMeQuery';

type PagedRow = {
  movies: Movie[];
  page: number;
  totalPages?: number;
  loading?: boolean;
  hasMore?: boolean;
};

export interface HomeResponse {
  hero?: Movie | null;
  trending: PagedRow;
  discovery: PagedRow;
  recommended: (RecommendedRow & { hasMore?: boolean }) | null;
}

export function useHomeQuery() {
   const { data: me } = useMeQuery();
   const isLoggedIn = !!me;
   return useQuery<HomeResponse>({
    queryKey: ['home',isLoggedIn],
    queryFn: getHome,
  });
}

