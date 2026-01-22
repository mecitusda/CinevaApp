import { useQuery } from "@tanstack/react-query";
import { Movie } from "../../types/movie";
import { getSimilarMovies } from "../../api/movies.api";


export type SimilarMoviesResponse = {
  movies: Movie[];
  page: number;
  hasMore?: boolean;
  loading: boolean;
};

export function useSimilarMoviesQuery(movieId?: number) {
  return useQuery<SimilarMoviesResponse>({
    queryKey: ["movie", movieId, "similar"],
    queryFn: () =>
      getSimilarMovies({
        movieId: movieId!,
        page: 1,
        limit: 20,
      }),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 60 * 6,
  });
}