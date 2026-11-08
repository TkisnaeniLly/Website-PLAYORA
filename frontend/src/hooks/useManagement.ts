import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTournaments,
  getManagedResults,
  reviewResults,
  reviewSingleResult,
  setPublished,
  submitResults,
} from "@/lib/management";
import type { AdminTournamentsQuery, ResultEntry } from "@/types/management";

export function useManagedResults(id: string | undefined) {
  return useQuery({
    queryKey: ["management", "results", id],
    queryFn: () => getManagedResults(id as string),
    enabled: typeof id === "string" && id.length > 0,
    retry: false,
  });
}

export function useSubmitResults(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (results: ResultEntry[]) => submitResults(id, results),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["management"] });
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useAdminTournaments(query: AdminTournamentsQuery) {
  return useQuery({
    queryKey: ["management", "admin", query],
    queryFn: () => getAdminTournaments(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useSetPublished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; isPublished: boolean }) =>
      setPublished(input.id, input.isPublished),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["management"] });
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useReviewResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      resultId?: string;
      decision: "APPROVED" | "REJECTED";
      note?: string;
    }) =>
      input.resultId
        ? reviewSingleResult(input.id, input.resultId, input.decision, input.note)
        : reviewResults(input.id, input.decision, input.note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["management"] });
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}
