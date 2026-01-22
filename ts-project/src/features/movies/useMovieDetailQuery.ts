import { useQuery } from '@tanstack/react-query';
import { getMovieDetail } from '../../api/movies.api';
import { MovieDetailResponse } from '../../types/movieDetails';
export function useMovieDetailQuery(id: number) {
  return useQuery<MovieDetailResponse>({
    queryKey: ['movie', id],
    queryFn: () => getMovieDetail(id),
  });
}
