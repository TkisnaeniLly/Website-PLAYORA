import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type { AdminReport } from "@/types/reports";

export async function getAdminReports(): Promise<AdminReport> {
  const response = await api.get<ApiSuccess<AdminReport>>("/admin/reports");
  return response.data.data;
}
