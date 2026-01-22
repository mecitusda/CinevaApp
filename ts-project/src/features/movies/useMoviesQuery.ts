// features/movies/useMoviesQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getMovies } from "../../api/movies.api";
import { Movie } from "../../types/movie";

type UseMoviesQueryParams = {
  genre: number;
  page: number;
  excludeIds?: number[];
  enabled?: boolean;
};

export function useMoviesQuery({
  genre,
  page,
  excludeIds = [],
  enabled = true,
}: UseMoviesQueryParams) {
  return useQuery<{
    movies: Movie[];
    page: number;
    hasMore: boolean;
    genre: number;
  }>({
     queryKey: [
    "movies",
    genre,
    page,
    excludeIds.join(","),
  ],
  queryFn: () =>
    getMovies({
      genre,
      page,
      excludeIds,
    }),

  staleTime: 1000 * 60 * 10, // 🧊 10 dakika
  gcTime: 1000 * 60 * 15,

  placeholderData: prev => prev,
  });
}