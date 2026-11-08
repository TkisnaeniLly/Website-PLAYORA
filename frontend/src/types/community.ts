export type CommunityCategory = "DISKUSI" | "TIPS" | "TURNAMEN" | "REKOMENDASI" | "EVENT";

export interface CommunityAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export interface CommunityCommentItem {
  id: string;
  body: string;
  createdAt: string;
  author: CommunityAuthor;
}

export interface CommunityPostItem {
  id: string;
  title: string;
  body: string;
  category: CommunityCategory;
  imageUrl: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommunityAuthor;
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
}

export interface CommunityPostDetail extends CommunityPostItem {
  comments: CommunityCommentItem[];
}

export interface CommunityListQuery {
  category?: CommunityCategory | "";
  q?: string;
  sort?: "terbaru" | "populer";
  page?: number;
  limit?: number;
}

export interface CommunityPageResult {
  items: CommunityPostItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PostFormValues {
  title: string;
  body: string;
  category: CommunityCategory;
  imageUrl?: string;
}
