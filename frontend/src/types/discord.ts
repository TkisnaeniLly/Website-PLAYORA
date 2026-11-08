export type DiscordRoomStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DiscordRoomGameRef {
  id: string;
  title: string;
  slug: string;
}

export interface DiscordRoomPublic {
  id: string;
  name: string;
  inviteUrl: string;
  description: string;
  memberCount: number | null;
  createdAt: string;
  game: DiscordRoomGameRef | null;
}

export interface DiscordRoomMine extends DiscordRoomPublic {
  status: DiscordRoomStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  updatedAt: string;
}

export interface DiscordRoomAdmin extends DiscordRoomMine {
  submitter: { id: string; name: string; username: string };
  reviewer: { name: string; username: string } | null;
}

export interface DiscordRoomPageResult {
  items: DiscordRoomPublic[];
  total: number;
  page: number;
  limit: number;
}

export interface DiscordRoomListQuery {
  q?: string;
  page?: number;
  limit?: number;
}

export interface DiscordRoomFormValues {
  name: string;
  inviteUrl: string;
  description: string;
  gameId?: string;
  memberCount?: number;
}

export type DiscordRoomUpdateValues = Partial<DiscordRoomFormValues>;
