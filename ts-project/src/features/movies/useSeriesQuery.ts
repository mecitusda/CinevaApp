import { useQuery } from "@tanstack/react-query";
import { getSeries } from "../../api/movies.api";
import { Movie } from "../../types/movie";

type UseSeriesQueryParams = {
  genre: number;
  page: number;
  excludeIds?: number[];
  enabled?: boolean;
};

export function useSeriesQuery({
  genre,
  page,
  excludeIds = [],
  enabled = true,
}: UseSeriesQueryParams) {
    
  return useQuery<{
    series: Movie[];
    page: number;
    hasMore: boolean;
  }>({
    queryKey: [
      "series",
      genre,
      page,
    ],
    queryFn: () =>
      getSeries({
        genre,
        page,
        excludeIds,
      }),
    placeholderData: prev => prev,
    enabled,
    
  });
}
