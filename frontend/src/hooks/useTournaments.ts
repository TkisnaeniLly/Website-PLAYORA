import { useQuery } from "@tanstack/react-query";
import { getTournamentDetail, getTournaments } from "@/lib/tournaments";
import type { TournamentsQuery } from "@/types/tournaments";

export function useTournaments(query: TournamentsQuery) {
  return useQuery({
    queryKey: ["tournaments", query],
    queryFn: () => getTournaments(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useTournamentDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["tournaments", "detail", slug],
    queryFn: () => getTournamentDetail(slug as string),
    enabled: typeof slug === "string" && slug.length > 0,
    retry: false,
  });
}

export function useUpcomingTournaments(limit = 3) {
  return useQuery({
    queryKey: ["tournaments", "upcoming", limit],
    queryFn: () => getTournaments({ status: "upcoming", limit }),
    staleTime: 2 * 60_000,
  });
}
