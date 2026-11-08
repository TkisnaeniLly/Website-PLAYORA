export interface AdminReportActivityPoint {
  date: string;
  users: number;
  posts: number;
  submissions: number;
}

export interface AdminReportTopGame {
  id: string;
  title: string;
  slug: string;
  favorites: number;
  articles: number;
}

export interface AdminReportContributor {
  id: string;
  name: string;
  username: string;
  articles: number;
  posts: number;
  total: number;
}

export interface AdminReport {
  content: {
    games: { total: number; published: number };
    articles: { total: number; published: number };
    tournaments: { total: number; published: number };
    community: { posts: number; comments: number; likes: number };
    discordRooms: { total: number; approved: number; pending: number; rejected: number };
  };
  users: { total: number; admins: number; regular: number; newLast30Days: number };
  activity: AdminReportActivityPoint[];
  topGames: AdminReportTopGame[];
  topContributors: AdminReportContributor[];
}
