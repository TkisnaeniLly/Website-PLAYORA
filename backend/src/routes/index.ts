import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { gameRoutes } from "../modules/games/games.routes";
import { articleRoutes } from "../modules/articles/articles.routes";
import { tournamentRoutes } from "../modules/tournaments/tournaments.routes";
import { submissionRoutes } from "../modules/submissions/submissions.routes";
import { notificationRoutes } from "../modules/notifications/notifications.routes";
import { profileRoutes } from "../modules/profile/profile.routes";
import { favoriteRoutes } from "../modules/favorites/favorites.routes";
import { bookmarkRoutes } from "../modules/bookmarks/bookmarks.routes";
import {
  adminTournamentRoutes,
  managedTournamentRoutes,
} from "../modules/tournament-management/management.routes";
import { adminManagementRoutes } from "../modules/admin-management/admin-management.routes";
import { adminUploadRoutes, uploadRoutes } from "../modules/uploads/uploads.routes";
import {
  adminChangeRequestRoutes,
  changeRequestRoutes,
} from "../modules/change-requests/change-requests.routes";
import { adminCommunityRoutes, communityRoutes } from "../modules/community/community.routes";
import {
  adminDiscordRoomRoutes,
  discordRoomRoutes,
} from "../modules/discord-rooms/discord-rooms.routes";

/**
 * Router agregat untuk seluruh endpoint `/api/v1`.
 * Rute manajemen turnamen dipasang sebelum rute publik agar `:id` tidak
 * tertangkap sebagai `:slug`.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/games", gameRoutes);
apiRouter.use("/articles", articleRoutes);
apiRouter.use("/tournaments", managedTournamentRoutes);
apiRouter.use("/tournaments", tournamentRoutes);
apiRouter.use("/submissions", submissionRoutes);
apiRouter.use("/me/notifications", notificationRoutes);
apiRouter.use("/me/profile", profileRoutes);
apiRouter.use("/me/favorites", favoriteRoutes);
apiRouter.use("/me/bookmarks", bookmarkRoutes);
apiRouter.use("/me/uploads", uploadRoutes);
apiRouter.use("/tournaments", changeRequestRoutes);
apiRouter.use("/community/discord-rooms", discordRoomRoutes);
apiRouter.use("/community", communityRoutes);
apiRouter.use("/admin/tournaments", adminTournamentRoutes);
apiRouter.use("/admin/discord-rooms", adminDiscordRoomRoutes);
apiRouter.use("/admin", adminManagementRoutes);
apiRouter.use("/admin/uploads", adminUploadRoutes);
apiRouter.use("/admin/change-requests", adminChangeRequestRoutes);
apiRouter.use("/admin/community", adminCommunityRoutes);
apiRouter.use("/admin", adminRoutes);
