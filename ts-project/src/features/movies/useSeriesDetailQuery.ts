import { useQuery } from "@tanstack/react-query";
import { getSeriesDetail } from "../../api/movies.api";
import { SeriesDetailResponse } from "../../types/seriesDetails";

export function useSeriesDetailQuery(id: number) {
  return useQuery<SeriesDetailResponse>({
    queryKey: ["series", id],
    queryFn: () => getSeriesDetail(id),
  });
}
