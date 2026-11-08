export type ChangeStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ChangePayload {
  title?: string;
  organizerName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string | null;
  registrationUrl?: string;
  contact?: string;
  format?: string;
  teamCount?: number;
  registrationMethod?: string;
  prizePool?: string;
  requirements?: string;
}

export interface ChangeRequestInput extends ChangePayload {
  message: string;
}

export interface ChangeRequestItem {
  id: string;
  payload: ChangePayload;
  message: string;
  status: ChangeStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  reviewer?: { name: string; username: string } | null;
  tournament?: { id: string; title: string; slug: string };
  requester?: { id: string; name: string; username: string };
}

export interface ChangeRequestPageResult {
  items: ChangeRequestItem[];
  total: number;
  page: number;
  limit: number;
}
