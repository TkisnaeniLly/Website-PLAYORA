import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth, RequireRole } from "@/components/auth/Guards";
import { HomePage } from "@/pages/public/HomePage";
import { GamesPage } from "@/pages/public/GamesPage";
import { GameDetailPage } from "@/pages/public/GameDetailPage";
import { ArticleListPage } from "@/pages/public/ArticleListPage";
import { ArticleDetailPage } from "@/pages/public/ArticleDetailPage";
import { TournamentsPage } from "@/pages/public/TournamentsPage";
import { TournamentDetailPage } from "@/pages/public/TournamentDetailPage";
import { SubmitTournamentPage } from "@/pages/user/SubmitTournamentPage";
import { MySubmissionsPage } from "@/pages/user/MySubmissionsPage";
import { SubmissionDetailPage } from "@/pages/user/SubmissionDetailPage";
import { NotificationsPage } from "@/pages/user/NotificationsPage";
import { AccountSettingsPage } from "@/pages/user/AccountSettingsPage";
import { FavoritesPage } from "@/pages/user/FavoritesPage";
import { BookmarksPage } from "@/pages/user/BookmarksPage";
import { AdminSubmissionsPage } from "@/pages/admin/AdminSubmissionsPage";
import { AdminTournamentsPage } from "@/pages/admin/AdminTournamentsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminGamesPage } from "@/pages/admin/AdminGamesPage";
import { AdminArticlesPage } from "@/pages/admin/AdminArticlesPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminChangeRequestsPage } from "@/pages/admin/AdminChangeRequestsPage";
import { AdminCommunityPage } from "@/pages/admin/AdminCommunityPage";
import { AdminDiscordRoomsPage } from "@/pages/admin/AdminDiscordRoomsPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CommunityPage } from "@/pages/community/CommunityPage";
import { CommunityDetailPage } from "@/pages/community/CommunityDetailPage";
import { TournamentChangeRequestPage } from "@/pages/user/TournamentChangeRequestPage";
import { ManageResultsPage } from "@/pages/admin/ManageResultsPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * Peta route PLAYORA.
 * Rute statis didaftarkan sebelum rute dinamis agar tidak tertangkap `:slug`.
 */
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
      {
        path: "/admin",
        element: (
          <RequireRole role="ADMIN">
            <AdminLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "games", element: <AdminGamesPage /> },
          { path: "articles", element: <AdminArticlesPage /> },
          { path: "tournaments", element: <AdminTournamentsPage /> },
          { path: "submissions", element: <AdminSubmissionsPage /> },
          { path: "change-requests", element: <AdminChangeRequestsPage /> },
          { path: "community", element: <AdminCommunityPage /> },
          { path: "discord-rooms", element: <AdminDiscordRoomsPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "reports", element: <AdminReportsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
          { path: "tournaments/:id/results", element: <ManageResultsPage /> },
        ],
      },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: "games", element: <GamesPage /> },
      { path: "games/:slug", element: <GameDetailPage /> },

      { path: "news", element: <ArticleListPage tipe="berita" /> },
      { path: "news/:slug", element: <ArticleDetailPage tipe="berita" /> },
      { path: "guides", element: <ArticleListPage tipe="panduan" /> },
      { path: "guides/:slug", element: <ArticleDetailPage tipe="panduan" /> },

      { path: "tournaments", element: <TournamentsPage /> },
      { path: "community", element: <CommunityPage /> },
      { path: "community/:id", element: <CommunityDetailPage /> },
      {
        path: "tournaments/:id/change-requests",
        element: (
          <RequireAuth>
            <TournamentChangeRequestPage />
          </RequireAuth>
        ),
      },
      {
        path: "tournaments/submit",
        element: (
          <RequireAuth>
            <SubmitTournamentPage />
          </RequireAuth>
        ),
      },
      {
        path: "tournaments/submissions",
        element: (
          <RequireAuth>
            <MySubmissionsPage />
          </RequireAuth>
        ),
      },
      {
        path: "tournaments/submissions/:id",
        element: (
          <RequireAuth>
            <SubmissionDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: "tournaments/:id/results/manage",
        element: (
          <RequireAuth>
            <ManageResultsPage />
          </RequireAuth>
        ),
      },
      { path: "tournaments/:slug", element: <TournamentDetailPage /> },

      {
        path: "notifications",
        element: (
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile/settings",
        element: (
          <RequireAuth>
            <AccountSettingsPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile/favorites",
        element: (
          <RequireAuth>
            <FavoritesPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile/bookmarks",
        element: (
          <RequireAuth>
            <BookmarksPage />
          </RequireAuth>
        ),
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
