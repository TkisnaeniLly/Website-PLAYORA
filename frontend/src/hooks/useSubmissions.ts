import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubmission,
  decideSubmission,
  getAdminSubmissions,
  getMySubmissions,
  getSubmissionDetail,
  updateSubmission,
} from "@/lib/submissions";
import type { SubmissionFormValues, SubmissionsQuery } from "@/types/submissions";

export function useMySubmissions(query: SubmissionsQuery) {
  return useQuery({
    queryKey: ["submissions", "me", query],
    queryFn: () => getMySubmissions(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useSubmissionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["submissions", "detail", id],
    queryFn: () => getSubmissionDetail(id as string),
    enabled: typeof id === "string" && id.length > 0,
    retry: false,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useUpdateSubmission(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SubmissionFormValues) => updateSubmission(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useAdminSubmissions(query: SubmissionsQuery) {
  return useQuery({
    queryKey: ["submissions", "admin", query],
    queryFn: () => getAdminSubmissions(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useDecideSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      decision: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
      note?: string;
    }) => decideSubmission(input.id, input.decision, input.note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: ["management"] });
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}
