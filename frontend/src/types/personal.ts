import type { GameListItem } from "./games";
import type { ArticleListItem } from "./articles";

export interface FavoriteItem {
  id: string;
  createdAt: string;
  game: GameListItem;
}

export interface FavoritesResult {
  items: FavoriteItem[];
  total: number;
}

export interface BookmarkItem {
  id: string;
  createdAt: string;
  article: ArticleListItem;
}

export interface BookmarksResult {
  items: BookmarkItem[];
  total: number;
}
