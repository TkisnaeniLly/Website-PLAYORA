-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 08 Nov 2026 pada 14.20
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `playora_test`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `articles`
--

CREATE TABLE `articles` (
  `id` char(36) NOT NULL,
  `title` varchar(250) NOT NULL,
  `slug` varchar(270) NOT NULL,
  `excerpt` varchar(500) DEFAULT NULL,
  `content` longtext NOT NULL,
  `category` enum('NEWS','UPDATE','TIPS','TUTORIAL','ESPORTS') NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `published_at` datetime(3) DEFAULT NULL,
  `author_id` char(36) NOT NULL,
  `game_id` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `bookmarks`
--

CREATE TABLE `bookmarks` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `article_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `community_comments`
--

CREATE TABLE `community_comments` (
  `id` char(36) NOT NULL,
  `post_id` char(36) NOT NULL,
  `author_id` char(36) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `community_posts`
--

CREATE TABLE `community_posts` (
  `id` char(36) NOT NULL,
  `author_id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `category` enum('DISKUSI','TIPS','TURNAMEN','REKOMENDASI','EVENT') NOT NULL DEFAULT 'DISKUSI',
  `image_url` varchar(500) DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `community_post_likes`
--

CREATE TABLE `community_post_likes` (
  `post_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `discord_rooms`
--

CREATE TABLE `discord_rooms` (
  `id` char(36) NOT NULL,
  `submitted_by` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `invite_url` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `game_id` char(36) DEFAULT NULL,
  `member_count` int(11) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `admin_note` text DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `games`
--

CREATE TABLE `games` (
  `id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text NOT NULL,
  `genre` varchar(100) NOT NULL,
  `developer` varchar(150) DEFAULT NULL,
  `publisher` varchar(150) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `is_popular` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `status` enum('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `game_platforms`
--

CREATE TABLE `game_platforms` (
  `game_id` char(36) NOT NULL,
  `platform_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `type` enum('SUBMISSION_CREATED','SUBMISSION_STATUS_CHANGED','SUBMISSION_APPROVED','SUBMISSION_REJECTED','SUBMISSION_NEEDS_REVISION','RESULT_APPROVED','RESULT_REJECTED','CHANGE_REQUEST_APPROVED','CHANGE_REQUEST_REJECTED','DISCORD_ROOM_APPROVED','DISCORD_ROOM_REJECTED') NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` varchar(500) NOT NULL,
  `reference_id` char(36) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `platforms`
--

CREATE TABLE `platforms` (
  `id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tournaments`
--

CREATE TABLE `tournaments` (
  `id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `game_id` char(36) NOT NULL,
  `manager_id` char(36) DEFAULT NULL,
  `title` varchar(250) NOT NULL,
  `slug` varchar(270) NOT NULL,
  `organizer_name` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `registration_url` varchar(500) DEFAULT NULL,
  `contact` varchar(200) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `registration_deadline` date DEFAULT NULL,
  `format` varchar(100) DEFAULT NULL,
  `prize_pool` varchar(200) DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` datetime(3) DEFAULT NULL,
  `published_by` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `registration_method` varchar(100) DEFAULT NULL,
  `team_count` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tournament_change_requests`
--

CREATE TABLE `tournament_change_requests` (
  `id` char(36) NOT NULL,
  `tournament_id` char(36) NOT NULL,
  `requested_by` char(36) NOT NULL,
  `payload` text NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tournament_results`
--

CREATE TABLE `tournament_results` (
  `id` char(36) NOT NULL,
  `tournament_id` char(36) NOT NULL,
  `position` int(11) NOT NULL,
  `team_or_player` varchar(150) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `admin_note` text DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `status` enum('PENDING_REVIEW','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING_REVIEW',
  `submitted_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tournament_result_reviews`
--

CREATE TABLE `tournament_result_reviews` (
  `id` char(36) NOT NULL,
  `result_id` char(36) NOT NULL,
  `actor_id` char(36) DEFAULT NULL,
  `action` enum('SUBMITTED','APPROVED','REJECTED') NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `tournament_result_reviews`
--

INSERT INTO `tournament_result_reviews` (`id`, `result_id`, `actor_id`, `action`, `note`, `created_at`) VALUES
('2615a3a1-bc9d-421a-b797-afe0427b9bcb', '0f039d69-13e3-4fdd-86ee-73705c4c90c8', 'e35c8c57-1fd2-4d7e-a9b4-fd9c137cbfcc', 'SUBMITTED', 'Diajukan oleh penyelenggara.', '2026-11-08 08:37:40.456'),
('651b0380-b126-4bad-b8e6-29ee6a7fc526', '391b33c3-3138-400f-823a-0c661e889ce5', 'e35c8c57-1fd2-4d7e-a9b4-fd9c137cbfcc', 'SUBMITTED', 'Diajukan oleh penyelenggara.', '2026-11-08 08:37:40.464'),
('9e3aa175-e851-4bd5-baa9-398695873cef', '79c75992-8f22-4ac2-b532-58ae490e81c3', 'e35c8c57-1fd2-4d7e-a9b4-fd9c137cbfcc', 'SUBMITTED', 'Diajukan oleh penyelenggara.', '2026-11-08 08:37:40.471');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tournament_reviews`
--

CREATE TABLE `tournament_reviews` (
  `id` char(36) NOT NULL,
  `submission_id` char(36) NOT NULL,
  `admin_id` char(36) NOT NULL,
  `decision` enum('PENDING','NEEDS_REVISION','APPROVED','REJECTED') NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tournament_submissions`
--

CREATE TABLE `tournament_submissions` (
  `id` char(36) NOT NULL,
  `submitted_by` char(36) NOT NULL,
  `game_id` char(36) NOT NULL,
  `title` varchar(250) NOT NULL,
  `organizer_name` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `registration_url` varchar(500) DEFAULT NULL,
  `contact` varchar(200) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `registration_deadline` date DEFAULT NULL,
  `format` varchar(100) DEFAULT NULL,
  `prize_pool` varchar(200) DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `status` enum('PENDING','NEEDS_REVISION','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `admin_note` text DEFAULT NULL,
  `submitted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `registration_method` varchar(100) DEFAULT NULL,
  `team_count` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `avatar_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `token_version` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password_hash`, `role`, `avatar_url`, `bio`, `is_active`, `created_at`, `updated_at`, `token_version`) VALUES
('1d88a600-cac1-4698-91b3-72d4d08da115', 'Pengguna tokenversi_1794127141351', 'tokenversi_1794127141351', 'tokenversi.1794127141351@playora.test', '$2b$08$lyLPrJTV/cyq7axjKcxiw.zJeIOs4XM/rpOLE9ZGBxiqQUxCElOl6', 'USER', NULL, NULL, 1, '2026-11-08 08:39:01.470', '2026-11-08 08:39:01.930', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_games`
--

CREATE TABLE `user_games` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `game_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('22c84abf-3df7-486c-842e-602ef7acbbd2', '1f43d9deaf6c80224fe49c9595640f59b6a24b222ea1cb2fcef44319ce7c9fb2', '2026-11-04 15:42:03.699', '20261104153806_add_submission_form_fields', NULL, NULL, '2026-11-04 15:42:03.636', 1),
('663a5aee-e0e5-4655-b135-e7307e70698c', 'b8dd481943f82cae9b13b5e826de1c3b3a733d3ad369ca5c1cbe91946b120651', '2026-11-04 13:29:26.149', '20261104132233_add_game_status_and_token_version', NULL, NULL, '2026-11-04 13:29:26.103', 1),
('8a598209-c8a3-4b80-ba93-382fc2c23196', '8cbda0db2e20d3b4d869f3b03c2e24c4db23aee29af3e2ddf53ea30984164514', '2026-11-07 12:29:37.121', '20261107050000_add_change_requests_and_community', NULL, NULL, '2026-11-07 12:29:37.121', 1),
('b73c854f-79cc-47b0-acc6-ee616ca7af68', '7b5893b698c0cffa1010fe978305a3329543ae963c779357f752a051c9f85fdb', '2026-11-04 16:46:08.023', '20261104164204_add_result_notification_types', NULL, NULL, '2026-11-04 16:46:08.012', 1),
('ddc139ea-b606-4650-be4b-3a767caba81c', '1bd1697c609d6eba38b4fcc8fac60b84bfd567e3c49a4d7b6977de7f9a240141', '2026-11-07 12:29:37.129', '20261107060000_add_change_request_notification_types', NULL, NULL, '2026-11-07 12:29:37.129', 1),
('de0d0b2a-67e3-4ee8-aec5-ddeacc5564a4', '21a261760cb26a5d0240866e40a1f674f8e2b1e82ad4a1392bfe11b374dfe1ad', '2026-11-04 13:29:26.100', '20261104114805_init_mvp_schema', NULL, NULL, '2026-11-04 13:29:22.345', 1),
('f31ad40b-d4a0-4c71-a66e-aeb4a4cd7de3', '6ff84739f7b367856392b7b6d25ad1c21583883c2a0eca8600c61fee981210ea', '2026-11-04 16:17:10.219', '20261104161422_add_result_review_workflow', NULL, NULL, '2026-11-04 16:17:09.922', 1),
('f9af9925-b93a-4487-92d6-a8a263d7f5af', '47a0a6e49e9594b28b1dafbf505494ab96545422bb0b1cf99e4dc4c52fb82575', '2026-11-08 03:30:28.520', '20261108095000_add_discord_rooms', NULL, NULL, '2026-11-08 03:30:28.287', 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `articles_slug_key` (`slug`),
  ADD KEY `articles_status_published_at_idx` (`status`,`published_at`),
  ADD KEY `articles_category_idx` (`category`),
  ADD KEY `articles_author_id_idx` (`author_id`),
  ADD KEY `articles_game_id_idx` (`game_id`),
  ADD KEY `articles_title_idx` (`title`);

--
-- Indeks untuk tabel `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookmarks_user_id_article_id_key` (`user_id`,`article_id`),
  ADD KEY `bookmarks_article_id_idx` (`article_id`);

--
-- Indeks untuk tabel `community_comments`
--
ALTER TABLE `community_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_comments_post_id_created_at_idx` (`post_id`,`created_at`),
  ADD KEY `community_comments_author_id_fkey` (`author_id`);

--
-- Indeks untuk tabel `community_posts`
--
ALTER TABLE `community_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_posts_is_hidden_created_at_idx` (`is_hidden`,`created_at`),
  ADD KEY `community_posts_category_idx` (`category`),
  ADD KEY `community_posts_author_id_fkey` (`author_id`);

--
-- Indeks untuk tabel `community_post_likes`
--
ALTER TABLE `community_post_likes`
  ADD PRIMARY KEY (`post_id`,`user_id`),
  ADD KEY `community_post_likes_user_id_idx` (`user_id`);

--
-- Indeks untuk tabel `discord_rooms`
--
ALTER TABLE `discord_rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discord_rooms_invite_url_key` (`invite_url`),
  ADD KEY `discord_rooms_status_created_at_idx` (`status`,`created_at`),
  ADD KEY `discord_rooms_submitted_by_idx` (`submitted_by`),
  ADD KEY `discord_rooms_game_id_idx` (`game_id`),
  ADD KEY `discord_rooms_reviewed_by_fkey` (`reviewed_by`);

--
-- Indeks untuk tabel `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `games_slug_key` (`slug`),
  ADD KEY `games_title_idx` (`title`),
  ADD KEY `games_genre_idx` (`genre`),
  ADD KEY `games_is_popular_idx` (`is_popular`),
  ADD KEY `games_status_idx` (`status`);

--
-- Indeks untuk tabel `game_platforms`
--
ALTER TABLE `game_platforms`
  ADD PRIMARY KEY (`game_id`,`platform_id`),
  ADD KEY `game_platforms_platform_id_idx` (`platform_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read_idx` (`user_id`,`is_read`),
  ADD KEY `notifications_created_at_idx` (`created_at`);

--
-- Indeks untuk tabel `platforms`
--
ALTER TABLE `platforms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `platforms_name_key` (`name`);

--
-- Indeks untuk tabel `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tournaments_slug_key` (`slug`),
  ADD UNIQUE KEY `tournaments_submission_id_key` (`submission_id`),
  ADD KEY `tournaments_is_published_start_date_idx` (`is_published`,`start_date`),
  ADD KEY `tournaments_game_id_idx` (`game_id`),
  ADD KEY `tournaments_manager_id_idx` (`manager_id`),
  ADD KEY `tournaments_title_idx` (`title`),
  ADD KEY `tournaments_published_by_fkey` (`published_by`);

--
-- Indeks untuk tabel `tournament_change_requests`
--
ALTER TABLE `tournament_change_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_change_requests_tournament_id_status_idx` (`tournament_id`,`status`),
  ADD KEY `tournament_change_requests_status_created_at_idx` (`status`,`created_at`),
  ADD KEY `tournament_change_requests_requested_by_fkey` (`requested_by`),
  ADD KEY `tournament_change_requests_reviewed_by_fkey` (`reviewed_by`);

--
-- Indeks untuk tabel `tournament_results`
--
ALTER TABLE `tournament_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tournament_results_tournament_id_position_key` (`tournament_id`,`position`),
  ADD KEY `tournament_results_tournament_id_idx` (`tournament_id`),
  ADD KEY `tournament_results_updated_by_fkey` (`updated_by`),
  ADD KEY `tournament_results_tournament_id_status_idx` (`tournament_id`,`status`),
  ADD KEY `tournament_results_submitted_by_fkey` (`submitted_by`),
  ADD KEY `tournament_results_reviewed_by_fkey` (`reviewed_by`);

--
-- Indeks untuk tabel `tournament_result_reviews`
--
ALTER TABLE `tournament_result_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_result_reviews_result_id_created_at_idx` (`result_id`,`created_at`),
  ADD KEY `tournament_result_reviews_actor_id_fkey` (`actor_id`);

--
-- Indeks untuk tabel `tournament_reviews`
--
ALTER TABLE `tournament_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_reviews_submission_id_created_at_idx` (`submission_id`,`created_at`),
  ADD KEY `tournament_reviews_admin_id_idx` (`admin_id`);

--
-- Indeks untuk tabel `tournament_submissions`
--
ALTER TABLE `tournament_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_submissions_status_idx` (`status`),
  ADD KEY `tournament_submissions_submitted_by_idx` (`submitted_by`),
  ADD KEY `tournament_submissions_game_id_idx` (`game_id`),
  ADD KEY `tournament_submissions_reviewed_by_fkey` (`reviewed_by`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_key` (`username`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_role_idx` (`role`);

--
-- Indeks untuk tabel `user_games`
--
ALTER TABLE `user_games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_games_user_id_game_id_key` (`user_id`,`game_id`),
  ADD KEY `user_games_game_id_idx` (`game_id`);

--
-- Indeks untuk tabel `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `articles_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookmarks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `community_comments`
--
ALTER TABLE `community_comments`
  ADD CONSTRAINT `community_comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `community_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `community_posts`
--
ALTER TABLE `community_posts`
  ADD CONSTRAINT `community_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `community_post_likes`
--
ALTER TABLE `community_post_likes`
  ADD CONSTRAINT `community_post_likes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `community_post_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `discord_rooms`
--
ALTER TABLE `discord_rooms`
  ADD CONSTRAINT `discord_rooms_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discord_rooms_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discord_rooms_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `game_platforms`
--
ALTER TABLE `game_platforms`
  ADD CONSTRAINT `game_platforms_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_platforms_platform_id_fkey` FOREIGN KEY (`platform_id`) REFERENCES `platforms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tournaments`
--
ALTER TABLE `tournaments`
  ADD CONSTRAINT `tournaments_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tournaments_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournaments_published_by_fkey` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournaments_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `tournament_submissions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tournament_change_requests`
--
ALTER TABLE `tournament_change_requests`
  ADD CONSTRAINT `tournament_change_requests_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_change_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_change_requests_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tournament_results`
--
ALTER TABLE `tournament_results`
  ADD CONSTRAINT `tournament_results_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_results_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_results_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_results_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tournament_result_reviews`
--
ALTER TABLE `tournament_result_reviews`
  ADD CONSTRAINT `tournament_result_reviews_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_result_reviews_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `tournament_results` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tournament_reviews`
--
ALTER TABLE `tournament_reviews`
  ADD CONSTRAINT `tournament_reviews_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_reviews_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `tournament_submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tournament_submissions`
--
ALTER TABLE `tournament_submissions`
  ADD CONSTRAINT `tournament_submissions_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_submissions_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_submissions_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_games`
--
ALTER TABLE `user_games`
  ADD CONSTRAINT `user_games_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
