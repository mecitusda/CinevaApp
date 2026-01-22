import { useQuery } from "@tanstack/react-query";
import { getSeriesTrailer } from "../../api/movies.api";


type Trailer = {
  key: string;
  site: "YouTube" | string;
  type: "Trailer" | "Teaser" | "Clip" | string;
} ;
export function useSeriesTrailerQuery(seriesId?: number) {
  return useQuery<Trailer>({
    queryKey: ["series", seriesId, "trailer"],
    queryFn: () => getSeriesTrailer(seriesId!),
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60 * 6,
  });
}
