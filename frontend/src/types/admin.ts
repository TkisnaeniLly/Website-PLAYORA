import type { ArticleCategory } from "./articles";

export type AdminStatus = "DRAFT" | "PUBLISHED";
export type AdminRole = "USER" | "ADMIN";

export interface AdminGameItem {
  id: string;
  title: string;
  slug: string;
  genre: string;
  description: string;
  developer: string | null;
  publisher: string | null;
  releaseDate: string | null;
  coverImageUrl: string | null;
  isPopular: boolean;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
  platforms: { platform: { id: string; name: string } }[];
}

export interface AdminArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: ArticleCategory;
  thumbnailUrl: string | null;
  status: AdminStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; username: string };
  game: { id: string; title: string; slug: string } | null;
}

export interface AdminUserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  _count: { submissions: number; notifications: number };
}

export interface AdminDashboard {
  users: { total: number; active: number };
  games: { total: number; published: number };
  articles: { total: number; published: number };
  tournaments: { total: number; published: number };
  submissions: {
    pending: number;
    needsRevision: number;
    approved: number;
    rejected: number;
  };
  pendingReviewResults: number;
  notifications: number;
  recentSubmissions: {
    id: string;
    title: string;
    status: "PENDING" | "NEEDS_REVISION" | "APPROVED" | "REJECTED";
    submittedAt: string;
    submitter: { name: string; username: string };
  }[];
}

export interface AdminGameInput {
  title: string;
  slug: string;
  description: string;
  genre: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  coverImageUrl?: string;
  isPopular?: boolean;
  status?: AdminStatus;
  platformIds?: string[];
}

export interface AdminArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: ArticleCategory;
  gameId?: string | null;
  thumbnailUrl?: string;
  status: AdminStatus;
  publishedAt?: string | null;
}

export interface AdminListQuery {
  q?: string;
  status?: AdminStatus;
  role?: AdminRole;
  page?: number;
  limit?: number;
}

export interface AdminPageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
