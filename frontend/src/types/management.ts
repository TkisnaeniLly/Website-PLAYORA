export type ResultStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface ManagedResult {
  id: string;
  position: number;
  teamOrPlayer: string;
  note: string | null;
  status: ResultStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  updatedAt: string;
  reviewer: { name: string; username: string } | null;
}

export interface ManagedTournamentInfo {
  id: string;
  slug: string;
  title: string;
  managerId: string | null;
  isPublished: boolean;
  submissionId: string | null;
}

export interface ManagedResultsResponse {
  turnamen: ManagedTournamentInfo;
  hasil: ManagedResult[];
}

export interface AdminTournamentItem {
  id: string;
  title: string;
  slug: string;
  organizerName: string;
  isPublished: boolean;
  publishedAt: string | null;
  startDate: string;
  endDate: string;
  game: { id: string; title: string; slug: string };
  manager: { id: string; name: string; username: string } | null;
  submissionStatus: string | null;
  totalResults: number;
  pendingResults: number;
  approvedResults: number;
}

export interface AdminTournamentsQuery {
  status?: "published" | "unpublished" | "awaiting_results" | "";
  page?: number;
  limit?: number;
}

export interface ResultEntry {
  position: number;
  teamOrPlayer: string;
  note?: string;
}
