import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  AdminSubmissionListItem,
  SubmissionDetail,
  SubmissionFormValues,
  SubmissionStatus,
  SubmissionsPageResult,
  SubmissionsQuery,
  SubmissionListItem,
} from "@/types/submissions";

export const LABEL_STATUS_PENGAJUAN: Record<SubmissionStatus, string> = {
  PENDING: "Menunggu",
  NEEDS_REVISION: "Perlu Revisi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const WARNA_STATUS_PENGAJUAN: Record<SubmissionStatus, string> = {
  PENDING: "bg-warning/15 text-warning",
  NEEDS_REVISION: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-danger/15 text-danger",
};

export const URUTAN_STATUS_PENGAJUAN: readonly SubmissionStatus[] = [
  "PENDING",
  "NEEDS_REVISION",
  "APPROVED",
  "REJECTED",
];

export function dapatDiajukanUlang(status: SubmissionStatus): boolean {
  return status === "NEEDS_REVISION";
}

export function buildSubmissionParams(
  query: SubmissionsQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (query.status) params.status = query.status;
  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

/** Membuang field opsional yang kosong agar tidak mengirim string kosong ke API. */
export function rapikanPayload(values: SubmissionFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [kunci, nilai] of Object.entries(values)) {
    if (nilai === undefined || nilai === null) continue;
    if (typeof nilai === "string" && nilai.trim() === "") continue;
    payload[kunci] = typeof nilai === "string" ? nilai.trim() : nilai;
  }

  return payload;
}

export async function createSubmission(
  values: SubmissionFormValues,
): Promise<{ id: string }> {
  const response = await api.post<ApiSuccess<{ id: string }>>(
    "/submissions",
    rapikanPayload(values),
  );
  return response.data.data;
}

export async function getMySubmissions(
  query: SubmissionsQuery,
): Promise<SubmissionsPageResult<SubmissionListItem>> {
  const response = await api.get<ApiSuccess<{ items: SubmissionListItem[] }>>(
    "/submissions/me",
    { params: buildSubmissionParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: 12, total: 0 };
  return { items: response.data.data.items, ...meta };
}

export async function getSubmissionDetail(id: string): Promise<SubmissionDetail> {
  const response = await api.get<ApiSuccess<{ submission: SubmissionDetail }>>(
    `/submissions/${encodeURIComponent(id)}`,
  );
  return response.data.data.submission;
}

export async function updateSubmission(
  id: string,
  values: Partial<SubmissionFormValues>,
): Promise<void> {
  await api.patch(`/submissions/${encodeURIComponent(id)}`, rapikanPayload(values as SubmissionFormValues));
}

export async function getAdminSubmissions(
  query: SubmissionsQuery,
): Promise<SubmissionsPageResult<AdminSubmissionListItem>> {
  const response = await api.get<ApiSuccess<{ items: AdminSubmissionListItem[] }>>(
    "/admin/submissions",
    { params: buildSubmissionParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: 12, total: 0 };
  return { items: response.data.data.items, ...meta };
}

export async function decideSubmission(
  id: string,
  decision: "APPROVED" | "REJECTED" | "NEEDS_REVISION",
  note?: string,
): Promise<{ tournamentId: string | null }> {
  const response = await api.patch<
    ApiSuccess<{ message: string; tournamentId: string | null }>
  >(`/admin/submissions/${encodeURIComponent(id)}/decision`, { decision, note });

  return { tournamentId: response.data.data.tournamentId };
}
