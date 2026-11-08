import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityPost,
  getAdminCommunityPosts,
  getCommunityPost,
  getCommunityPosts,
  setCommunityHidden,
  toggleCommunityLike,
  updateCommunityPost,
} from "@/lib/community";
import type { CommunityListQuery, PostFormValues } from "@/types/community";

const KUNCI = ["community"];

export function useCommunityPosts(query: CommunityListQuery) {
  return useQuery({
    queryKey: [...KUNCI, "posts", query],
    queryFn: () => getCommunityPosts(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useCommunityPost(id: string | undefined) {
  return useQuery({
    queryKey: [...KUNCI, "post", id],
    queryFn: () => getCommunityPost(id as string),
    enabled: typeof id === "string" && id.length > 0,
    retry: false,
  });
}

function invalidasi(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: KUNCI });
  void queryClient.invalidateQueries({ queryKey: ["admin", "community"] });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PostFormValues) => createCommunityPost(values),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useUpdateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; values: PostFormValues }) =>
      updateCommunityPost(input.id, input.values),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCommunityPost(id),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useAddCommunityComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addCommunityComment(postId, body),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useToggleCommunityLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => toggleCommunityLike(postId),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useAdminCommunityPosts(query: CommunityListQuery) {
  return useQuery({
    queryKey: ["admin", "community", query],
    queryFn: () => getAdminCommunityPosts(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useSetCommunityHidden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; isHidden: boolean }) =>
      setCommunityHidden(input.id, input.isHidden),
    onSuccess: () => invalidasi(queryClient),
  });
}
