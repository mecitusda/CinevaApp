import { useQuery } from "@tanstack/react-query";
import { getMovieTrailer } from "../../api/movies.api";

export function useTrailerQuery(tmdbId?: number) {
  return useQuery({
    queryKey: ["trailer", tmdbId],
    queryFn: () => getMovieTrailer(tmdbId!),
    enabled: !!tmdbId,
    staleTime: 1000 * 60 * 60, // 1 saat
  });
}
