import { useQuery } from "@tanstack/react-query";
import { Movie } from "../../types/movie";
import { getSimilarSeries } from "../../api/movies.api";

export type SimilarSeriesResponse = {
  series: Movie[];
  page: number;
  hasMore?: boolean;
};

export function useSimilarSeriesQuery(seriesId?: number) {
  return useQuery<SimilarSeriesResponse>({
    queryKey: ["series", seriesId, "similar"],
    queryFn: () =>
      getSimilarSeries({
        seriesId: seriesId!,
        page: 1,
        limit: 20,
      }),
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60 * 6,
  });
}
