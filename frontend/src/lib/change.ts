import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  ChangeRequestInput,
  ChangeRequestItem,
  ChangeRequestPageResult,
  ChangeStatus,
} from "@/types/change";

export const BATAS_PERUBAHAN = 12;

export const LABEL_STATUS_PERUBAHAN: Record<ChangeStatus, string> = {
  PENDING: "Menunggu tinjauan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const WARNA_STATUS_PERUBAHAN: Record<ChangeStatus, string> = {
  PENDING: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-danger/15 text-danger",
};

const LABEL_FIELD: Record<string, string> = {
  title: "Judul",
  organizerName: "Penyelenggara",
  description: "Deskripsi",
  startDate: "Tanggal mulai",
  endDate: "Tanggal selesai",
  registrationDeadline: "Batas pendaftaran",
  registrationUrl: "URL pendaftaran",
  contact: "Kontak",
  format: "Format",
  teamCount: "Jumlah tim",
  registrationMethod: "Metode pendaftaran",
  prizePool: "Hadiah",
  requirements: "Persyaratan",
};

/** Ringkasan field yang diminta untuk diubah, dipakai pada daftar & tinjauan admin. */
export function ringkasPerubahan(payload: Record<string, unknown>): string[] {
  return Object.entries(payload)
    .filter(([, nilai]) => nilai !== undefined && nilai !== null && nilai !== "")
    .map(([kunci, nilai]) => {
      const label = LABEL_FIELD[kunci] ?? kunci;
      const teks =
        typeof nilai === "string" && /^\d{4}-\d{2}-\d{2}/.test(nilai)
          ? new Date(nilai).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : String(nilai);
      return `${label}: ${teks}`;
    });
}

export async function getChangeRequests(tournamentId: string): Promise<ChangeRequestItem[]> {
  const response = await api.get<ApiSuccess<{ items: ChangeRequestItem[] }>>(
    `/tournaments/${encodeURIComponent(tournamentId)}/change-requests`,
  );
  return response.data.data.items;
}

export async function createChangeRequest(
  tournamentId: string,
  values: ChangeRequestInput,
): Promise<ChangeRequestItem> {
  const response = await api.post<ApiSuccess<{ request: ChangeRequestItem }>>(
    `/tournaments/${encodeURIComponent(tournamentId)}/change-requests`,
    values,
  );
  return response.data.data.request;
}

export async function getAdminChangeRequests(
  query: { status?: ChangeStatus | ""; page?: number; limit?: number },
): Promise<ChangeRequestPageResult> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.page && query.page > 1) params.page = query.page;
  if (query.limit) params.limit = query.limit;

  const response = await api.get<ApiSuccess<{ items: ChangeRequestItem[] }>>(
    "/admin/change-requests",
    { params },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_PERUBAHAN, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function decideChangeRequest(
  id: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
): Promise<void> {
  await api.patch(`/admin/change-requests/${encodeURIComponent(id)}/decision`, {
    decision,
    note,
  });
}
