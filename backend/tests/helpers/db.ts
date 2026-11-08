import { prisma } from "../../src/config/prisma";

const URUTAN_PEMBERSIHAN = [
  "notifications",
  "discord_rooms",
  "community_post_likes",
  "community_comments",
  "community_posts",
  "tournament_change_requests",
  "bookmarks",
  "user_games",
  "tournament_results",
  "tournaments",
  "tournament_reviews",
  "tournament_submissions",
  "articles",
  "game_platforms",
  "platforms",
  "games",
  "users",
] as const;

export async function bersihkanData(): Promise<void> {
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
  for (const tabel of URUTAN_PEMBERSIHAN) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tabel}\``);
  }
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
}

export { prisma };
