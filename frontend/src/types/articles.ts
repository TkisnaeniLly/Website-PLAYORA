export type ArticleType = "berita" | "panduan";

export type ArticleCategory = "NEWS" | "UPDATE" | "TIPS" | "TUTORIAL" | "ESPORTS";

export interface ArticleAuthor {
  name: string;
  username: string;
}

export interface ArticleGameRef {
  id: string;
  title: string;
  slug: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: ArticleCategory;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  author: ArticleAuthor;
  game: ArticleGameRef | null;
}

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: ArticleCategory;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthor & { avatarUrl: string | null };
  game:
    | (ArticleGameRef & { genre: string; coverImageUrl: string | null })
    | null;
}

export interface ArticleCategoryCount {
  value: ArticleCategory;
  count: number;
}

export interface ArticleFilters {
  categories: ArticleCategoryCount[];
}

export interface ArticlesQuery {
  q?: string;
  type?: ArticleType;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ArticlesPageResult {
  items: ArticleListItem[];
  total: number;
  page: number;
  limit: number;
}
