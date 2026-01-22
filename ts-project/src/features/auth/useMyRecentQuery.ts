import { useQuery } from "@tanstack/react-query";
import { getMylist } from "../../api/auth.api";
import { MyListResponse } from "../../types/Mylist";

export function useMyRecentQuery() {
  return useQuery<MyListResponse>({
    queryKey: ["mylist", "recent"],
    queryFn: getMylist,
    retry: false,
    staleTime: 50 * 60 * 1000, // 50 dakika (signed URL 1 saat geçerli)
    gcTime: 1 * 60 * 60 * 1000, // 1 saat
    refetchOnMount: true
  });
}
