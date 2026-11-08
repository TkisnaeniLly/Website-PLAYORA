export type TournamentStatus = "upcoming" | "ongoing" | "finished";

export interface TournamentGameRef {
  id: string;
  title: string;
  slug: string;
  genre: string;
}

export interface TournamentListItem {
  id: string;
  title: string;
  slug: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  format: string | null;
  prizePool: string | null;
  status: TournamentStatus;
  game: TournamentGameRef;
}

export interface TournamentResult {
  id: string;
  position: number;
  teamOrPlayer: string;
  note: string | null;
}

export interface TournamentDetail {
  id: string;
  title: string;
  slug: string;
  organizerName: string;
  description: string;
  registrationUrl: string | null;
  contact: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  format: string | null;
  prizePool: string | null;
  requirements: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  canManage: boolean;
  status: TournamentStatus;
  game: TournamentGameRef & { coverImageUrl: string | null };
  results: TournamentResult[];
}

export interface TournamentsQuery {
  status?: TournamentStatus | "";
  page?: number;
  limit?: number;
}

export interface TournamentsPageResult {
  items: TournamentListItem[];
  total: number;
  page: number;
  limit: number;
}
