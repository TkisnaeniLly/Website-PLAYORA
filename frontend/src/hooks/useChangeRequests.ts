import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChangeRequest,
  decideChangeRequest,
  getAdminChangeRequests,
  getChangeRequests,
} from "@/lib/change";
import type { ChangeRequestInput, ChangeStatus } from "@/types/change";

export function useChangeRequests(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ["change-requests", tournamentId],
    queryFn: () => getChangeRequests(tournamentId as string),
    enabled: typeof tournamentId === "string" && tournamentId.length > 0,
    retry: false,
  });
}

export function useCreateChangeRequest(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ChangeRequestInput) => createChangeRequest(tournamentId, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["change-requests", tournamentId] });
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useAdminChangeRequests(query: {
  status?: ChangeStatus | "";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin", "change-requests", query],
    queryFn: () => getAdminChangeRequests(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useDecideChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; decision: "APPROVED" | "REJECTED"; note?: string }) =>
      decideChangeRequest(input.id, input.decision, input.note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "change-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["management"] });
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      void queryClient.invalidateQueries({ queryKey: ["change-requests"] });
    },
  });
}
