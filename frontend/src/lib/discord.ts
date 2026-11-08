import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  DiscordRoomAdmin,
  DiscordRoomFormValues,
  DiscordRoomListQuery,
  DiscordRoomMine,
  DiscordRoomPageResult,
  DiscordRoomPublic,
  DiscordRoomStatus,
  DiscordRoomUpdateValues,
} from "@/types/discord";

export const BATAS_RUANG_DISCORD = 9;

export const LABEL_STATUS_RUANG: Record<DiscordRoomStatus, string> = {
  PENDING: "Menunggu validasi",
  APPROVED: "Tampil",
  REJECTED: "Ditolak",
};

export const WARNA_STATUS_RUANG: Record<DiscordRoomStatus, string> = {
  PENDING: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-danger/15 text-danger",
};

export const DAFTAR_STATUS_RUANG: DiscordRoomStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

export function buildDiscordRoomParams(
  query: DiscordRoomListQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  const q = query.q?.trim();
  if (q) params.q = q;

  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

export function formatAnggota(nilai: number | null): string | null {
  if (nilai === null || !Number.isFinite(nilai)) return null;
  return `${nilai.toLocaleString("id-ID")} anggota`;
}

export async function getDiscordRooms(
  query: DiscordRoomListQuery,
): Promise<DiscordRoomPageResult> {
  const response = await api.get<ApiSuccess<{ items: DiscordRoomPublic[] }>>(
    "/community/discord-rooms",
    { params: buildDiscordRoomParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_RUANG_DISCORD, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function getMyDiscordRooms(): Promise<DiscordRoomMine[]> {
  const response = await api.get<ApiSuccess<{ items: DiscordRoomMine[] }>>(
    "/community/discord-rooms/mine",
  );
  return response.data.data.items;
}

export async function createDiscordRoom(
  values: DiscordRoomFormValues,
): Promise<DiscordRoomMine> {
  const response = await api.post<ApiSuccess<{ room: DiscordRoomMine }>>(
    "/community/discord-rooms",
    values,
  );
  return response.data.data.room;
}

export async function updateDiscordRoom(
  id: string,
  values: DiscordRoomUpdateValues,
): Promise<DiscordRoomMine> {
  const response = await api.patch<ApiSuccess<{ room: DiscordRoomMine }>>(
    `/community/discord-rooms/${encodeURIComponent(id)}`,
    values,
  );
  return response.data.data.room;
}

export async function getAdminDiscordRooms(
  query: DiscordRoomListQuery & { status?: DiscordRoomStatus | "" },
): Promise<{ items: DiscordRoomAdmin[]; total: number; page: number; limit: number }> {
  const params = buildDiscordRoomParams(query);
  if (query.status) params.status = query.status;

  const response = await api.get<ApiSuccess<{ items: DiscordRoomAdmin[] }>>(
    "/admin/discord-rooms",
    { params },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_RUANG_DISCORD, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function reviewDiscordRoom(
  id: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
): Promise<void> {
  await api.patch(`/admin/discord-rooms/${encodeURIComponent(id)}/review`, {
    decision,
    note,
  });
}
