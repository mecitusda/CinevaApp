import { useQuery } from "@tanstack/react-query";
import { getPersonDetail } from "../../api/movies.api";

export function usePersonDetailQuery(personId?: number | null) {
  return useQuery({
    queryKey: ["person-detail", personId],
    queryFn: () => getPersonDetail(personId!),
    enabled: !!personId, // 🔴 modal açıkken çalışır
  });
}
