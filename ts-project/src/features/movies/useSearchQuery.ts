import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../../api/movies.api";

type Params = {
  q: string;
  page?: number;
  type?: "all" | "movie" | "tv";
};

export function useSearchQuery({ q, page = 1, type = "all" }: Params) {
  return useQuery({
    queryKey: ["search", q, type, page],
    queryFn: () =>
      searchMovies(q, { page, type }),

    enabled: q.length > 0,

    staleTime: 1000 * 60 * 5, // 5 dk cache
    gcTime: 1000 * 60 * 10,

    placeholderData: prev => prev,
  });
}
