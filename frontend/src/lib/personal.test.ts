import { describe, expect, it } from "vitest";
import { isBookmarked, isFavorited } from "./personal";
import type { BookmarkItem, FavoriteItem } from "@/types/personal";
import type { GameListItem } from "@/types/games";
import type { ArticleListItem } from "@/types/articles";

const game: GameListItem = {
  id: "game-1",
  title: "Valorant",
  slug: "valorant",
  genre: "FPS",
  coverImageUrl: null,
  isPopular: true,
  releaseDate: null,
  platforms: [],
};

const artikel: ArticleListItem = {
  id: "artikel-1",
  title: "Berita",
  slug: "berita",
  excerpt: null,
  category: "NEWS",
  thumbnailUrl: null,
  publishedAt: null,
  author: { name: "Admin", username: "admin" },
  game: null,
};

describe("isFavorited", () => {
  it("mengenali game yang ada di daftar", () => {
    const items: FavoriteItem[] = [{ id: "fav-1", createdAt: "2026-01-01", game }];
    expect(isFavorited(items, "game-1")).toBe(true);
  });

  it("tidak mengenali game yang belum difavoritkan", () => {
    const items: FavoriteItem[] = [{ id: "fav-1", createdAt: "2026-01-01", game }];
    expect(isFavorited(items, "game-2")).toBe(false);
  });

  it("aman pada daftar kosong", () => {
    expect(isFavorited([], "game-1")).toBe(false);
  });
});

describe("isBookmarked", () => {
  it("mengenali artikel yang ada di daftar", () => {
    const items: BookmarkItem[] = [{ id: "sim-1", createdAt: "2026-01-01", article: artikel }];
    expect(isBookmarked(items, "artikel-1")).toBe(true);
  });

  it("tidak mengenali artikel yang belum disimpan", () => {
    const items: BookmarkItem[] = [{ id: "sim-1", createdAt: "2026-01-01", article: artikel }];
    expect(isBookmarked(items, "artikel-2")).toBe(false);
  });

  it("aman pada daftar kosong", () => {
    expect(isBookmarked([], "artikel-1")).toBe(false);
  });
});
