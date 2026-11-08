import { useQuery } from "@tanstack/react-query";
import { getAdminReports } from "@/lib/reports";

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: getAdminReports,
    retry: false,
  });
}
