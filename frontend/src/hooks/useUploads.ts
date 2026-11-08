import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUploadStatus, uploadAvatar } from "@/lib/uploads";

export function useUploadStatus(enabled = true) {
  return useQuery({
    queryKey: ["uploads", "status"],
    queryFn: getUploadStatus,
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataUrl: string) => uploadAvatar(dataUrl),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
