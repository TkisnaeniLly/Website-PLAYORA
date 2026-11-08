import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBookmark,
  addFavorite,
  getBookmarks,
  getFavorites,
  removeBookmark,
  removeFavorite,
} from "@/lib/personal";

const KUNCI = ["personal"];

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: [...KUNCI, "favorites"],
    queryFn: getFavorites,
    enabled,
    retry: false,
  });
}

export function useBookmarks(enabled = true) {
  return useQuery({
    queryKey: [...KUNCI, "bookmarks"],
    queryFn: getBookmarks,
    enabled,
    retry: false,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { gameId: string; aktif: boolean }) =>
      input.aktif ? removeFavorite(input.gameId) : addFavorite(input.gameId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KUNCI });
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { articleId: string; aktif: boolean }) =>
      input.aktif ? removeBookmark(input.articleId) : addBookmark(input.articleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KUNCI });
    },
  });
}
