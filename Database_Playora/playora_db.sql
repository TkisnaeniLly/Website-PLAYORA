-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 08 Nov 2026 pada 14.19
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
-- Database: `playora_db`
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

--
-- Dumping data untuk tabel `articles`
--

INSERT INTO `articles` (`id`, `title`, `slug`, `excerpt`, `content`, `category`, `thumbnail_url`, `status`, `published_at`, `author_id`, `game_id`, `created_at`, `updated_at`) VALUES
('30000000-0000-4000-8000-000000000001', 'Jadwal Turnamen Esports Nasional Kuartal Pertama 2027', 'jadwal-turnamen-esports-nasional-kuartal-pertama-2027', 'Rangkaian turnamen esports nasional kuartal pertama 2027 telah diumumkan. Berikut daftar tanggal dan kota penyelenggaraannya.', 'Penyelenggara esports nasional merilis kalender turnamen untuk kuartal pertama 2027. Turnamen akan digelar di lima kota dengan format kualifikasi terbuka sebelum babak utama.\n\nPendaftaran peserta dilakukan langsung melalui tautan resmi masing-masing penyelenggara, bukan melalui PLAYORA. Informasi pada halaman ini disusun sebagai direktori agar penggemar dapat memantau jadwal.', 'NEWS', NULL, 'PUBLISHED', '2026-10-10 09:00:00.000', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '2026-11-04 12:42:58.564', '2026-11-08 03:51:59.984'),
('30000000-0000-4000-8000-000000000002', 'Pembaruan Musim Baru Mobile Legends: Apa yang Berubah?', 'pembaruan-musim-baru-mobile-legends', 'Penyesuaian keseimbangan hero, perubahan item, dan penyesuaian peta menjadi sorotan pada pembaruan musim terbaru.', 'Pembaruan musim terbaru membawa sejumlah penyesuaian keseimbangan. Beberapa hero mendapat pengurangan damage awal, sementara item bertahan mengalami penyesuaian harga.\n\nPemain disarankan meninjau ulang susunan item dan rotasi awal permainan. Perubahan ini berlaku bertahap pada server regional.', 'UPDATE', NULL, 'PUBLISHED', '2026-10-11 09:00:00.000', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '2026-11-04 12:42:58.573', '2026-11-08 03:51:59.989'),
('30000000-0000-4000-8000-000000000003', 'Lima Tips Meningkatkan Akurasi Aim di Valorant', 'lima-tips-meningkatkan-akurasi-aim-valorant', 'Latihan rutin, pengaturan sensitivitas, dan disiplin crosshair placement memberi dampak paling besar pada akurasi.', 'Akurasi aim dibangun dari kebiasaan, bukan bakat semata. Mulailah dengan menetapkan sensitivitas yang konsisten dan tidak diubah-ubah setiap sesi.\n\nLatihan singkat namun rutin lebih efektif daripada sesi panjang yang jarang. Fokuskan latihan pada crosshair placement dan kontrol recoil jarak dekat.', 'TIPS', NULL, 'PUBLISHED', '2026-10-12 09:00:00.000', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '2026-11-04 12:42:58.576', '2026-11-08 03:51:59.993'),
('30000000-0000-4000-8000-000000000004', 'Panduan Memulai Genshin Impact untuk Pemain Baru', 'panduan-memulai-genshin-impact', 'Urutan eksplorasi, pengelolaan resin, dan prioritas peningkatan karakter untuk pemain yang baru memulai.', 'Pemain baru sebaiknya menyelesaikan rangkaian misi pembuka sebelum melakukan eksplorasi bebas. Hal ini membuka sistem utama seperti peningkatan karakter dan domain.\n\nResin sebaiknya digunakan secara rutin, bukan ditumpuk hingga penuh. Prioritaskan peningkatan satu tim inti sebelum menyebar sumber daya ke banyak karakter.', 'TUTORIAL', NULL, 'PUBLISHED', '2026-10-13 09:00:00.000', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', '2026-11-04 12:42:58.581', '2026-11-08 03:51:59.997'),
('30000000-0000-4000-8000-000000000005', 'Analisis Meta Turnamen Elden Ring Komunitas', 'analisis-meta-turnamen-elden-ring-komunitas', 'Susunan build yang paling sering muncul pada turnamen komunitas dan alasan di balik popularitasnya.', 'Turnamen komunitas Elden Ring menampilkan variasi build yang cukup luas. Meskipun demikian, beberapa susunan statistik mendominasi babak akhir.\n\nFaktor penentu bukan hanya statistik, tetapi juga penguasaan timing dan pengelolaan stamina. Analisis ini disusun dari rekaman pertandingan yang dipublikasikan penyelenggara.', 'ESPORTS', NULL, 'PUBLISHED', '2026-10-14 09:00:00.000', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', '2026-11-04 12:42:58.585', '2026-11-08 03:52:00.004'),
('30000000-0000-4000-8000-000000000006', 'Komunitas Lokal Gelar Turnamen Amal untuk Pendidikan', 'komunitas-lokal-gelar-turnamen-amal-pendidikan', 'Turnamen amal komunitas berhasil mengumpulkan dana untuk program beasiswa pendidikan.', 'Sejumlah komunitas gamer lokal menggelar turnamen amal dengan format hiburan. Seluruh hasil donasi disalurkan ke program beasiswa.\n\nKegiatan ini menunjukkan peran komunitas dalam membangun sisi positif ekosistem gaming Indonesia.', 'NEWS', NULL, 'PUBLISHED', '2026-10-15 09:00:00.000', '00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', '2026-11-04 12:42:58.590', '2026-11-08 03:52:00.017');

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

--
-- Dumping data untuk tabel `bookmarks`
--

INSERT INTO `bookmarks` (`id`, `user_id`, `article_id`, `created_at`) VALUES
('90000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', '2026-11-06 04:07:38.410');

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

--
-- Dumping data untuk tabel `community_comments`
--

INSERT INTO `community_comments` (`id`, `post_id`, `author_id`, `body`, `created_at`) VALUES
('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Aku sedang memainkan Genshin Impact dan masih menikmati eksplorasinya.', '2026-11-07 06:29:03.290'),
('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Latihan komunikasi singkat sebelum pertandingan sangat membantu tim kami.', '2026-11-07 06:29:03.295');

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

--
-- Dumping data untuk tabel `community_posts`
--

INSERT INTO `community_posts` (`id`, `author_id`, `title`, `body`, `category`, `image_url`, `is_hidden`, `created_at`, `updated_at`) VALUES
('c0000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'Rekomendasi game RPG terbaik tahun ini?', 'Menurut kalian, game RPG apa yang paling seru tahun ini? Aku lagi mencari rekomendasi untuk dimainkan bersama teman.', 'REKOMENDASI', NULL, 0, '2026-11-07 06:29:03.278', '2026-11-08 03:52:00.099'),
('c0000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Tips persiapan turnamen untuk tim pemula', 'Bagikan strategi latihan, pembagian peran, dan cara komunikasi tim yang efektif sebelum mengikuti turnamen pertama.', 'TIPS', NULL, 0, '2026-11-07 06:29:03.283', '2026-11-08 03:52:00.106'),
('c0000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000004', 'Cari teman mabar Valorant akhir pekan', 'Ada yang ingin bermain Valorant akhir pekan ini? Tinggalkan rank dan jam bermain kalian di komentar.', 'DISKUSI', NULL, 0, '2026-11-07 06:29:03.286', '2026-11-08 03:52:00.110');

-- --------------------------------------------------------

--
-- Struktur dari tabel `community_post_likes`
--

CREATE TABLE `community_post_likes` (
  `post_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `community_post_likes`
--

INSERT INTO `community_post_likes` (`post_id`, `user_id`, `created_at`) VALUES
('c0000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '2026-11-07 06:29:03.298'),
('c0000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '2026-11-07 06:29:03.302');

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

--
-- Dumping data untuk tabel `discord_rooms`
--

INSERT INTO `discord_rooms` (`id`, `submitted_by`, `name`, `invite_url`, `description`, `game_id`, `member_count`, `status`, `admin_note`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`) VALUES
('e0000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'Valorant Indonesia Mabar', 'https://discord.gg/playora-valorant', 'Server Discord untuk mencari tim Valorant, latihan scrim, dan berdiskusi strategi map. Aktif setiap malam.', '20000000-0000-4000-8000-000000000002', 1250, 'APPROVED', NULL, '00000000-0000-4000-8000-000000000001', '2026-11-01 10:00:00.000', '2026-11-08 03:52:00.135', '2026-11-08 03:52:00.135'),
('e0000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'MLBB Komunitas Nusantara', 'https://discord.gg/playora-mlbb', 'Tempat berkumpul pemain Mobile Legends: cari duo, bahas meta terbaru, dan ikut turnamen komunitas mingguan.', '20000000-0000-4000-8000-000000000001', 860, 'APPROVED', NULL, '00000000-0000-4000-8000-000000000001', '2026-11-02 09:30:00.000', '2026-11-08 03:52:00.142', '2026-11-08 03:52:00.142'),
('e0000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000004', 'Genshin Teyvat Santai', 'https://discord.gg/playora-genshin', 'Ruang santai pembahas Genshin Impact: bantuan boss, showcase build, dan diskusi pembaruan versi.', '20000000-0000-4000-8000-000000000003', 320, 'PENDING', NULL, NULL, NULL, '2026-11-08 03:52:00.146', '2026-11-08 03:52:00.146');

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

--
-- Dumping data untuk tabel `games`
--

INSERT INTO `games` (`id`, `title`, `slug`, `description`, `genre`, `developer`, `publisher`, `release_date`, `cover_image_url`, `is_popular`, `created_at`, `updated_at`, `status`) VALUES
('20000000-0000-4000-8000-000000000001', 'Mobile Legends: Bang Bang', 'mobile-legends-bang-bang', 'Game MOBA mobile 5 lawan 5 yang mempertemukan dua tim untuk menghancurkan basis lawan. Populer di kalangan pemain Indonesia dengan ekosistem turnamen yang besar.', 'MOBA', 'Moonton', 'Moonton', '2016-07-14', NULL, 1, '2026-11-04 12:42:58.466', '2026-11-08 03:51:59.916', 'PUBLISHED'),
('20000000-0000-4000-8000-000000000002', 'Valorant', 'valorant', 'Penembak taktis 5 lawan 5 berbasis agen dengan kemampuan unik. Menekankan kerja sama tim, penguasaan peta, dan akurasi mekanik.', 'FPS', 'Riot Games', 'Riot Games', '2020-06-02', NULL, 1, '2026-11-04 12:42:58.483', '2026-11-08 03:51:59.927', 'PUBLISHED'),
('20000000-0000-4000-8000-000000000003', 'Genshin Impact', 'genshin-impact', 'RPG dunia terbuka dengan sistem elemen dan eksplorasi luas di dunia Teyvat. Mendukung lintas platform dan pembaruan konten berkala.', 'Action RPG', 'HoYoverse', 'HoYoverse', '2020-09-28', NULL, 1, '2026-11-04 12:42:58.496', '2026-11-08 03:51:59.936', 'PUBLISHED'),
('20000000-0000-4000-8000-000000000004', 'EA SPORTS FC 26', 'ea-sports-fc-26', 'Simulasi sepak bola dengan mode karier, ultimate team, dan pertandingan daring. Menyediakan liga serta klub dari berbagai negara.', 'Sports', 'EA Vancouver', 'EA Sports', '2025-09-26', NULL, 0, '2026-11-04 12:42:58.518', '2026-11-08 03:51:59.952', 'PUBLISHED'),
('20000000-0000-4000-8000-000000000005', 'The Legend of Zelda: Tears of the Kingdom', 'zelda-tears-of-the-kingdom', 'Petualangan dunia terbuka dengan kemampuan merakit benda dan eksplorasi langit serta bawah tanah Hyrule.', 'Adventure', 'Nintendo EPD', 'Nintendo', '2023-05-12', NULL, 0, '2026-11-04 12:42:58.539', '2026-11-08 03:51:59.965', 'PUBLISHED'),
('20000000-0000-4000-8000-000000000006', 'Elden Ring', 'elden-ring', 'Action RPG dunia terbuka dengan pertarungan menantang, eksplorasi bebas, dan narasi yang disampaikan melalui lingkungan.', 'Action RPG', 'FromSoftware', 'Bandai Namco', '2022-02-25', NULL, 1, '2026-11-04 12:42:58.547', '2026-11-08 03:51:59.973', 'PUBLISHED');

-- --------------------------------------------------------

--
-- Struktur dari tabel `game_platforms`
--

CREATE TABLE `game_platforms` (
  `game_id` char(36) NOT NULL,
  `platform_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `game_platforms`
--

INSERT INTO `game_platforms` (`game_id`, `platform_id`) VALUES
('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005'),
('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002'),
('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005'),
('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002'),
('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003'),
('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004'),
('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002'),
('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003');

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

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `reference_id`, `is_read`, `created_at`) VALUES
('6d5e9c15-f6d2-4bda-bcde-859582edf50b', '00000000-0000-4000-8000-000000000003', 'CHANGE_REQUEST_APPROVED', 'Permintaan perubahan disetujui', 'Perubahan informasi pada turnamen \"Playora Community Cup Valorant Seri 1\" telah disetujui dan diterapkan.', '60000000-0000-4000-8000-000000000001', 0, '2026-11-08 07:30:34.827'),
('718aff0c-bd07-4577-b662-a578d8e82809', '00000000-0000-4000-8000-000000000003', 'CHANGE_REQUEST_APPROVED', 'Permintaan perubahan disetujui', 'Perubahan informasi pada turnamen \"Playora Community Cup Valorant Seri 1\" telah disetujui dan diterapkan.', '60000000-0000-4000-8000-000000000001', 0, '2026-11-08 07:32:54.955'),
('a0000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'SUBMISSION_APPROVED', 'Pengajuan turnamen disetujui', 'Pengajuan \"Playora Community Cup Valorant Seri 1\" telah disetujui dan dipublikasikan.', '40000000-0000-4000-8000-000000000002', 0, '2026-11-04 12:42:58.659');

-- --------------------------------------------------------

--
-- Struktur dari tabel `platforms`
--

CREATE TABLE `platforms` (
  `id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `platforms`
--

INSERT INTO `platforms` (`id`, `name`, `created_at`) VALUES
('10000000-0000-4000-8000-000000000001', 'PC', '2026-11-04 12:42:58.434'),
('10000000-0000-4000-8000-000000000002', 'PlayStation 5', '2026-11-04 12:42:58.442'),
('10000000-0000-4000-8000-000000000003', 'Xbox Series X|S', '2026-11-04 12:42:58.447'),
('10000000-0000-4000-8000-000000000004', 'Nintendo Switch', '2026-11-04 12:42:58.452'),
('10000000-0000-4000-8000-000000000005', 'Mobile', '2026-11-04 12:42:58.458');

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

--
-- Dumping data untuk tabel `tournaments`
--

INSERT INTO `tournaments` (`id`, `submission_id`, `game_id`, `manager_id`, `title`, `slug`, `organizer_name`, `description`, `registration_url`, `contact`, `start_date`, `end_date`, `registration_deadline`, `format`, `prize_pool`, `requirements`, `is_published`, `published_at`, `published_by`, `created_at`, `updated_at`, `registration_method`, `team_count`) VALUES
('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Playora Community Cup Valorant Seri 1', 'playora-community-cup-valorant-seri-1', 'Komunitas Valorant Indonesia', 'Turnamen daring terbuka untuk tim amatir. Babak kualifikasi dilaksanakan secara daring, babak utama digelar luring.', 'https://contoh.playora.id/daftar/community-cup-1', 'komunitas@contoh.id', '2026-12-05', '2026-12-07', '2026-11-28', '5v5, single elimination', 'Rp10.000.000', 'Tim amatir, tidak ada pemain profesional terdaftar.', 1, '2026-11-01 10:05:00.000', '00000000-0000-4000-8000-000000000001', '2026-11-04 12:42:58.620', '2026-11-08 07:32:54.904', 'Online', 16);

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

--
-- Dumping data untuk tabel `tournament_results`
--

INSERT INTO `tournament_results` (`id`, `tournament_id`, `position`, `team_or_player`, `note`, `updated_by`, `created_at`, `updated_at`, `admin_note`, `reviewed_at`, `reviewed_by`, `status`, `submitted_by`) VALUES
('70000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', 1, 'Garuda Prime', 'Juara 1', '00000000-0000-4000-8000-000000000003', '2026-11-04 12:42:58.628', '2026-11-08 03:52:00.057', 'Hasil sesuai laporan penyelenggara.', '2026-11-02 09:00:00.000', '00000000-0000-4000-8000-000000000001', 'APPROVED', '00000000-0000-4000-8000-000000000003'),
('70000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 2, 'Nusantara Five', 'Juara 2', '00000000-0000-4000-8000-000000000003', '2026-11-04 12:42:58.633', '2026-11-08 03:52:00.068', 'Hasil sesuai laporan penyelenggara.', '2026-11-02 09:00:00.000', '00000000-0000-4000-8000-000000000001', 'APPROVED', '00000000-0000-4000-8000-000000000003'),
('70000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000001', 3, 'Rimba Esport', 'Juara 3', '00000000-0000-4000-8000-000000000003', '2026-11-04 12:42:58.637', '2026-11-08 03:52:00.075', 'Hasil sesuai laporan penyelenggara.', '2026-11-02 09:00:00.000', '00000000-0000-4000-8000-000000000001', 'APPROVED', '00000000-0000-4000-8000-000000000003');

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
('b0000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'APPROVED', 'Hasil sesuai laporan penyelenggara.', '2026-11-05 08:58:16.353'),
('b0000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'APPROVED', 'Hasil sesuai laporan penyelenggara.', '2026-11-05 08:58:16.368'),
('b0000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'APPROVED', 'Hasil sesuai laporan penyelenggara.', '2026-11-05 08:58:16.384');

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

--
-- Dumping data untuk tabel `tournament_reviews`
--

INSERT INTO `tournament_reviews` (`id`, `submission_id`, `admin_id`, `decision`, `note`, `created_at`) VALUES
('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'APPROVED', 'Informasi lengkap dan tautan pendaftaran dapat diverifikasi.', '2026-11-04 12:42:58.611');

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

--
-- Dumping data untuk tabel `tournament_submissions`
--

INSERT INTO `tournament_submissions` (`id`, `submitted_by`, `game_id`, `title`, `organizer_name`, `description`, `registration_url`, `contact`, `start_date`, `end_date`, `registration_deadline`, `format`, `prize_pool`, `requirements`, `status`, `admin_note`, `submitted_at`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`, `registration_method`, `team_count`) VALUES
('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Turnamen Kampus Mobile Legends 2027', 'Himpunan Mahasiswa Teknik Informatika', 'Turnamen antarprogram studi dengan format grup dilanjutkan sistem gugur. Terbuka untuk mahasiswa aktif.', 'https://contoh.playora.id/daftar/turnamen-kampus', 'turnamen@contoh.ac.id', '2027-02-10', '2027-02-14', '2027-02-05', '5v5, grup + gugur', 'Rp5.000.000', 'Mahasiswa aktif, satu tim maksimal 6 orang.', 'PENDING', NULL, '2026-11-04 12:42:58.593', NULL, NULL, '2026-11-04 12:42:58.593', '2026-11-08 03:52:00.029', 'Online', 32),
('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Playora Community Cup Valorant Seri 1', 'Komunitas Valorant Indonesia', 'Turnamen daring terbuka untuk tim amatir. Babak kualifikasi dilaksanakan secara daring, babak utama digelar luring.', 'https://contoh.playora.id/daftar/community-cup-1', 'komunitas@contoh.id', '2026-12-05', '2026-12-07', '2026-11-28', '5v5, single elimination', 'Rp10.000.000', 'Tim amatir, tidak ada pemain profesional terdaftar.', 'APPROVED', 'Informasi lengkap dan tautan pendaftaran dapat diverifikasi.', '2026-11-04 12:42:58.602', '00000000-0000-4000-8000-000000000001', '2026-11-01 10:00:00.000', '2026-11-04 12:42:58.602', '2026-11-08 03:52:00.038', 'Online', 16);

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
('00000000-0000-4000-8000-000000000001', 'Administrator PLAYORA', 'admin', 'admin@playora.id', '$2b$10$4ZkdxtXvppI4SNjA9yJg9OqhbwaHbhkXN/yER8WguwLzO5m.cYsRG', 'ADMIN', NULL, 'Akun administrator platform.', 1, '2026-11-04 12:42:58.376', '2026-11-08 10:11:03.886', 0),
('00000000-0000-4000-8000-000000000002', 'Tika Isnaeni', 'tika', 'tika@playora.id', '$2b$10$4ZkdxtXvppI4SNjA9yJg9OqhbwaHbhkXN/yER8WguwLzO5m.cYsRG', 'USER', NULL, 'Penggemar MOBA dan penggemar turnamen lokal.', 1, '2026-11-04 12:42:58.410', '2026-11-08 03:51:59.888', 0),
('00000000-0000-4000-8000-000000000003', 'Arman Maulana', 'arman', 'arman@playora.id', '$2b$10$4ZkdxtXvppI4SNjA9yJg9OqhbwaHbhkXN/yER8WguwLzO5m.cYsRG', 'USER', NULL, 'Pengelola komunitas turnamen Valorant.', 1, '2026-11-04 12:42:58.421', '2026-11-08 03:51:59.892', 0),
('00000000-0000-4000-8000-000000000004', 'Syah Rizky', 'syah', 'syah@playora.id', '$2b$10$4ZkdxtXvppI4SNjA9yJg9OqhbwaHbhkXN/yER8WguwLzO5m.cYsRG', 'USER', NULL, 'Pemain kasual yang suka game dunia terbuka.', 1, '2026-11-04 12:42:58.427', '2026-11-08 03:51:59.896', 0);

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

--
-- Dumping data untuk tabel `user_games`
--

INSERT INTO `user_games` (`id`, `user_id`, `game_id`, `created_at`) VALUES
('80000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '2026-11-06 04:07:38.402'),
('80000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', '2026-11-04 12:42:58.647');

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
('4254ee75-8f73-43f0-a8d4-b8ceb75ca384', '6ff84739f7b367856392b7b6d25ad1c21583883c2a0eca8600c61fee981210ea', '2026-11-04 16:14:44.800', '20261104161422_add_result_review_workflow', NULL, NULL, '2026-11-04 16:14:44.479', 1),
('48628885-6fb7-4a0c-a0d9-ebf0d099e0f6', '21a261760cb26a5d0240866e40a1f674f8e2b1e82ad4a1392bfe11b374dfe1ad', '2026-11-04 11:48:06.675', '20261104114805_init_mvp_schema', NULL, NULL, '2026-11-04 11:48:05.152', 1),
('78cf8f4d-8493-4999-9ce1-040b556c35fa', 'b8dd481943f82cae9b13b5e826de1c3b3a733d3ad369ca5c1cbe91946b120651', '2026-11-04 13:23:02.248', '20261104132233_add_game_status_and_token_version', NULL, NULL, '2026-11-04 13:23:02.189', 1),
('90f7bc48-0471-4f2b-916a-b46a1bb36693', '1f43d9deaf6c80224fe49c9595640f59b6a24b222ea1cb2fcef44319ce7c9fb2', '2026-11-04 15:38:24.494', '20261104153806_add_submission_form_fields', NULL, NULL, '2026-11-04 15:38:24.397', 1),
('b1999ffe-f120-4f3a-8e25-f5d845844c05', '8cbda0db2e20d3b4d869f3b03c2e24c4db23aee29af3e2ddf53ea30984164514', '2026-11-07 12:16:13.000', '20261107050000_add_change_requests_and_community', NULL, NULL, '2026-11-07 12:16:13.000', 1),
('c3cc07dc-5789-4682-babf-191a5efabea6', '7b5893b698c0cffa1010fe978305a3329543ae963c779357f752a051c9f85fdb', '2026-11-04 16:42:24.656', '20261104164204_add_result_notification_types', NULL, NULL, '2026-11-04 16:42:24.639', 1),
('c4f550a5-cfb4-480e-824a-9dfa5ab31097', '1bd1697c609d6eba38b4fcc8fac60b84bfd567e3c49a4d7b6977de7f9a240141', '2026-11-07 12:21:29.000', '20261107060000_add_change_request_notification_types', NULL, NULL, '2026-11-07 12:21:29.000', 1),
('e57edfb0-c431-435e-adb8-8e3b5654fb3d', '47a0a6e49e9594b28b1dafbf505494ab96545422bb0b1cf99e4dc4c52fb82575', '2026-11-08 03:29:12.164', '20261108095000_add_discord_rooms', NULL, NULL, '2026-11-08 03:29:11.926', 1);

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
