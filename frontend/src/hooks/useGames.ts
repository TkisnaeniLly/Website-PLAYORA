import { useQuery } from "@tanstack/react-query";
import { getGames, getGameFilters, getGameDetail } from "@/lib/games";
import type { GamesQuery } from "@/types/games";

export function useGames(query: GamesQuery, aktif = true) {
  return useQuery({
    queryKey: ["games", query],
    queryFn: () => getGames(query),
    enabled: aktif,
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useGameFilters() {
  return useQuery({
    queryKey: ["games", "filters"],
    queryFn: getGameFilters,
    staleTime: 5 * 60_000,
  });
}

export function useGameDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["games", "detail", slug],
    queryFn: () => getGameDetail(slug as string),
    enabled: typeof slug === "string" && slug.length > 0,
    retry: false,
  });
}
