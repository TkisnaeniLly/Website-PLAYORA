export type SubmissionStatus = "PENDING" | "NEEDS_REVISION" | "APPROVED" | "REJECTED";

export interface SubmissionGameRef {
  id: string;
  title: string;
  slug: string;
}

export interface SubmissionListItem {
  id: string;
  title: string;
  status: SubmissionStatus;
  adminNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  startDate: string;
  endDate: string;
  teamCount: number | null;
  prizePool: string | null;
  game: SubmissionGameRef;
}

export interface SubmissionDetail extends SubmissionListItem {
  organizerName: string;
  description: string;
  registrationUrl: string | null;
  contact: string | null;
  registrationMethod: string | null;
  registrationDeadline: string | null;
  format: string | null;
  requirements: string | null;
  reviewer: { name: string; username: string } | null;
  tournament: { id: string; slug: string; isPublished: boolean } | null;
}

export interface AdminSubmissionListItem extends SubmissionListItem {
  organizerName: string;
  submitter: { name: string; username: string; email: string };
}

export interface SubmissionFormValues {
  title: string;
  gameId: string;
  organizerName: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  format: string;
  teamCount: number;
  prizePool?: string;
  requirements?: string;
  registrationMethod: string;
  registrationUrl?: string;
  contact?: string;
}

export interface SubmissionsQuery {
  status?: SubmissionStatus | "";
  page?: number;
  limit?: number;
}

export interface SubmissionsPageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
