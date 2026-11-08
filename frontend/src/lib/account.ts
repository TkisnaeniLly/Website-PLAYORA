import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  NotificationsPageResult,
  NotificationsQuery,
  PasswordFormValues,
  ProfileFormValues,
  ProfileUser,
} from "@/types/account";
import type { NotificationType } from "@/types/account";

export const BATAS_NOTIFIKASI = 20;

export const KELOMPOK_NOTIFIKASI: Record<NotificationType, string> = {
  SUBMISSION_CREATED: "Pengajuan",
  SUBMISSION_STATUS_CHANGED: "Pengajuan",
  SUBMISSION_APPROVED: "Pengajuan",
  SUBMISSION_REJECTED: "Pengajuan",
  SUBMISSION_NEEDS_REVISION: "Pengajuan",
  RESULT_APPROVED: "Hasil",
  RESULT_REJECTED: "Hasil",
  CHANGE_REQUEST_APPROVED: "Perubahan",
  CHANGE_REQUEST_REJECTED: "Perubahan",
};

export const WARNA_NOTIFIKASI: Record<NotificationType, string> = {
  SUBMISSION_CREATED: "bg-navy-100 text-navy-700",
  SUBMISSION_STATUS_CHANGED: "bg-warning/15 text-warning",
  SUBMISSION_APPROVED: "bg-success/15 text-success",
  SUBMISSION_REJECTED: "bg-danger/15 text-danger",
  SUBMISSION_NEEDS_REVISION: "bg-warning/15 text-warning",
  RESULT_APPROVED: "bg-success/15 text-success",
  RESULT_REJECTED: "bg-danger/15 text-danger",
  CHANGE_REQUEST_APPROVED: "bg-success/15 text-success",
  CHANGE_REQUEST_REJECTED: "bg-danger/15 text-danger",
};

export function buildNotificationParams(
  query: NotificationsQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (query.unreadOnly) params.unreadOnly = "true";

  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

/**
 * Tujuan tautan notifikasi. Notifikasi pengajuan membuka detail pengajuan,
 * notifikasi hasil membuka halaman kelola hasil turnamen.
 */
export function notificationLink(
  type: NotificationType,
  referenceId: string | null,
): string | null {
  if (!referenceId) return null;

  if (
    type === "RESULT_APPROVED" ||
    type === "RESULT_REJECTED" ||
    type === "CHANGE_REQUEST_APPROVED" ||
    type === "CHANGE_REQUEST_REJECTED"
  ) {
    return `/tournaments/${referenceId}/results/manage`;
  }

  return `/tournaments/submissions/${referenceId}`;
}

export async function getNotifications(
  query: NotificationsQuery,
): Promise<NotificationsPageResult> {
  const response = await api.get<ApiSuccess<{ items: NotificationsPageResult["items"]; unreadCount: number }>>(
    "/me/notifications",
    { params: buildNotificationParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_NOTIFIKASI, total: 0 };

  return {
    items: response.data.data.items,
    unreadCount: response.data.data.unreadCount,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<ApiSuccess<{ unreadCount: number }>>(
    "/me/notifications/unread-count",
  );
  return response.data.data.unreadCount;
}

export async function markRead(id: string): Promise<void> {
  await api.patch(`/me/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllRead(): Promise<number> {
  const response = await api.patch<ApiSuccess<{ jumlah: number }>>(
    "/me/notifications/read-all",
  );
  return response.data.data.jumlah;
}

export async function getProfile(): Promise<ProfileUser> {
  const response = await api.get<ApiSuccess<{ user: ProfileUser }>>("/me/profile");
  return response.data.data.user;
}

export async function updateProfile(values: ProfileFormValues): Promise<ProfileUser> {
  const payload: Record<string, string> = { name: values.name, username: values.username };
  if (values.bio !== undefined) payload.bio = values.bio;
  if (values.avatarUrl !== undefined) payload.avatarUrl = values.avatarUrl;

  const response = await api.patch<ApiSuccess<{ user: ProfileUser }>>(
    "/me/profile",
    payload,
  );
  return response.data.data.user;
}

export async function changePassword(values: PasswordFormValues): Promise<void> {
  await api.patch("/me/profile/password", values);
}
