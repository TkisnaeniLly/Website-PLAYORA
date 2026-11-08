export interface PlatformRef {
  platform: { id: string; name: string };
}

export interface GameListItem {
  id: string;
  title: string;
  slug: string;
  genre: string;
  coverImageUrl: string | null;
  isPopular: boolean;
  releaseDate: string | null;
  platforms: PlatformRef[];
}

export interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: "NEWS" | "UPDATE" | "TIPS" | "TUTORIAL" | "ESPORTS";
  thumbnailUrl: string | null;
  publishedAt: string | null;
}

export interface RelatedTournament {
  id: string;
  title: string;
  slug: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  prizePool: string | null;
}

export interface GameDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  developer: string | null;
  publisher: string | null;
  releaseDate: string | null;
  coverImageUrl: string | null;
  isPopular: boolean;
  platforms: PlatformRef[];
  articles: RelatedArticle[];
  tournaments: RelatedTournament[];
}

export interface GameFilters {
  platforms: { id: string; name: string }[];
  genres: string[];
}

export interface GamesQuery {
  q?: string;
  platform?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

export interface GamesPageResult {
  items: GameListItem[];
  total: number;
  page: number;
  limit: number;
}
