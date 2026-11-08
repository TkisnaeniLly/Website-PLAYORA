import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminArticle,
  createAdminGame,
  deleteAdminArticle,
  deleteAdminGame,
  getAdminArticles,
  getAdminDashboard,
  getAdminGames,
  getAdminUsers,
  updateAdminArticle,
  updateAdminGame,
  updateAdminUser,
} from "@/lib/admin";
import type {
  AdminArticleInput,
  AdminGameInput,
  AdminListQuery,
} from "@/types/admin";

const KUNCI = ["admin"];

export function useAdminDashboard() {
  return useQuery({
    queryKey: [...KUNCI, "dashboard"],
    queryFn: getAdminDashboard,
    retry: false,
  });
}

export function useAdminGames(query: AdminListQuery) {
  return useQuery({
    queryKey: [...KUNCI, "games", query],
    queryFn: () => getAdminGames(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useAdminArticles(query: AdminListQuery) {
  return useQuery({
    queryKey: [...KUNCI, "articles", query],
    queryFn: () => getAdminArticles(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useAdminUsers(query: AdminListQuery) {
  return useQuery({
    queryKey: [...KUNCI, "users", query],
    queryFn: () => getAdminUsers(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

function gunakanInvalidasi(queryClient: ReturnType<typeof useQueryClient>) {
  return (kunci: string) => {
    void queryClient.invalidateQueries({ queryKey: [...KUNCI, kunci] });
    void queryClient.invalidateQueries({ queryKey: [...KUNCI, "dashboard"] });
  };
}

export function useCreateAdminGame() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (input: AdminGameInput) => createAdminGame(input),
    onSuccess: () => invalidasi("games"),
  });
}

export function useUpdateAdminGame() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (input: { id: string; data: Partial<AdminGameInput> }) =>
      updateAdminGame(input.id, input.data),
    onSuccess: () => invalidasi("games"),
  });
}

export function useDeleteAdminGame() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (id: string) => deleteAdminGame(id),
    onSuccess: () => invalidasi("games"),
  });
}

export function useCreateAdminArticle() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (input: AdminArticleInput) => createAdminArticle(input),
    onSuccess: () => invalidasi("articles"),
  });
}

export function useUpdateAdminArticle() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (input: { id: string; data: Partial<AdminArticleInput> }) =>
      updateAdminArticle(input.id, input.data),
    onSuccess: () => invalidasi("articles"),
  });
}

export function useDeleteAdminArticle() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (id: string) => deleteAdminArticle(id),
    onSuccess: () => invalidasi("articles"),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const invalidasi = gunakanInvalidasi(queryClient);

  return useMutation({
    mutationFn: (input: {
      id: string;
      data: { role?: "USER" | "ADMIN"; isActive?: boolean };
    }) => updateAdminUser(input.id, input.data),
    onSuccess: () => invalidasi("users"),
  });
}
