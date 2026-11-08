import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  BookmarkItem,
  BookmarksResult,
  FavoriteItem,
  FavoritesResult,
} from "@/types/personal";

export async function getFavorites(): Promise<FavoritesResult> {
  const response = await api.get<ApiSuccess<{ items: FavoriteItem[]; total: number }>>(
    "/me/favorites",
  );

  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
}

export async function addFavorite(gameId: string): Promise<void> {
  await api.post(`/me/favorites/${encodeURIComponent(gameId)}`);
}

export async function removeFavorite(gameId: string): Promise<void> {
  await api.delete(`/me/favorites/${encodeURIComponent(gameId)}`);
}

export async function getBookmarks(): Promise<BookmarksResult> {
  const response = await api.get<ApiSuccess<{ items: BookmarkItem[]; total: number }>>(
    "/me/bookmarks",
  );

  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
}

export async function addBookmark(articleId: string): Promise<void> {
  await api.post(`/me/bookmarks/${encodeURIComponent(articleId)}`);
}

export async function removeBookmark(articleId: string): Promise<void> {
  await api.delete(`/me/bookmarks/${encodeURIComponent(articleId)}`);
}

/** Mencari apakah sebuah game sudah ada di daftar favorit pengguna. */
export function isFavorited(items: FavoriteItem[], gameId: string): boolean {
  return items.some((item) => item.game.id === gameId);
}

/** Mencari apakah sebuah artikel sudah ada di daftar simpanan pengguna. */
export function isBookmarked(items: BookmarkItem[], articleId: string): boolean {
  return items.some((item) => item.article.id === articleId);
}
