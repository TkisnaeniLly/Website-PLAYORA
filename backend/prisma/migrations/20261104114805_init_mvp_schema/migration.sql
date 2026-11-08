-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `avatar_url` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `games` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL,
    `description` TEXT NOT NULL,
    `genre` VARCHAR(100) NOT NULL,
    `developer` VARCHAR(150) NULL,
    `publisher` VARCHAR(150) NULL,
    `release_date` DATE NULL,
    `cover_image_url` VARCHAR(500) NULL,
    `is_popular` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `games_slug_key`(`slug`),
    INDEX `games_title_idx`(`title`),
    INDEX `games_genre_idx`(`genre`),
    INDEX `games_is_popular_idx`(`is_popular`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platforms` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `platforms_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_platforms` (
    `game_id` CHAR(36) NOT NULL,
    `platform_id` CHAR(36) NOT NULL,

    INDEX `game_platforms_platform_id_idx`(`platform_id`),
    PRIMARY KEY (`game_id`, `platform_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(250) NOT NULL,
    `slug` VARCHAR(270) NOT NULL,
    `excerpt` VARCHAR(500) NULL,
    `content` LONGTEXT NOT NULL,
    `category` ENUM('NEWS', 'UPDATE', 'TIPS', 'TUTORIAL', 'ESPORTS') NOT NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `published_at` DATETIME(3) NULL,
    `author_id` CHAR(36) NOT NULL,
    `game_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_status_published_at_idx`(`status`, `published_at`),
    INDEX `articles_category_idx`(`category`),
    INDEX `articles_author_id_idx`(`author_id`),
    INDEX `articles_game_id_idx`(`game_id`),
    INDEX `articles_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_submissions` (
    `id` CHAR(36) NOT NULL,
    `submitted_by` CHAR(36) NOT NULL,
    `game_id` CHAR(36) NOT NULL,
    `title` VARCHAR(250) NOT NULL,
    `organizer_name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `registration_url` VARCHAR(500) NULL,
    `contact` VARCHAR(200) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `registration_deadline` DATE NULL,
    `format` VARCHAR(100) NULL,
    `prize_pool` VARCHAR(200) NULL,
    `requirements` TEXT NULL,
    `status` ENUM('PENDING', 'NEEDS_REVISION', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `admin_note` TEXT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_by` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tournament_submissions_status_idx`(`status`),
    INDEX `tournament_submissions_submitted_by_idx`(`submitted_by`),
    INDEX `tournament_submissions_game_id_idx`(`game_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_reviews` (
    `id` CHAR(36) NOT NULL,
    `submission_id` CHAR(36) NOT NULL,
    `admin_id` CHAR(36) NOT NULL,
    `decision` ENUM('PENDING', 'NEEDS_REVISION', 'APPROVED', 'REJECTED') NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tournament_reviews_submission_id_created_at_idx`(`submission_id`, `created_at`),
    INDEX `tournament_reviews_admin_id_idx`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournaments` (
    `id` CHAR(36) NOT NULL,
    `submission_id` CHAR(36) NULL,
    `game_id` CHAR(36) NOT NULL,
    `manager_id` CHAR(36) NULL,
    `title` VARCHAR(250) NOT NULL,
    `slug` VARCHAR(270) NOT NULL,
    `organizer_name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `registration_url` VARCHAR(500) NULL,
    `contact` VARCHAR(200) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `registration_deadline` DATE NULL,
    `format` VARCHAR(100) NULL,
    `prize_pool` VARCHAR(200) NULL,
    `requirements` TEXT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `published_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tournaments_submission_id_key`(`submission_id`),
    UNIQUE INDEX `tournaments_slug_key`(`slug`),
    INDEX `tournaments_is_published_start_date_idx`(`is_published`, `start_date`),
    INDEX `tournaments_game_id_idx`(`game_id`),
    INDEX `tournaments_manager_id_idx`(`manager_id`),
    INDEX `tournaments_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_results` (
    `id` CHAR(36) NOT NULL,
    `tournament_id` CHAR(36) NOT NULL,
    `position` INTEGER NOT NULL,
    `team_or_player` VARCHAR(150) NOT NULL,
    `note` VARCHAR(300) NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tournament_results_tournament_id_idx`(`tournament_id`),
    UNIQUE INDEX `tournament_results_tournament_id_position_key`(`tournament_id`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_games` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `game_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_games_game_id_idx`(`game_id`),
    UNIQUE INDEX `user_games_user_id_game_id_key`(`user_id`, `game_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmarks` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bookmarks_article_id_idx`(`article_id`),
    UNIQUE INDEX `bookmarks_user_id_article_id_key`(`user_id`, `article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('SUBMISSION_STATUS_CHANGED', 'SUBMISSION_APPROVED', 'SUBMISSION_REJECTED', 'SUBMISSION_NEEDS_REVISION') NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `reference_id` CHAR(36) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_platforms` ADD CONSTRAINT `game_platforms_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_platforms` ADD CONSTRAINT `game_platforms_platform_id_fkey` FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_submissions` ADD CONSTRAINT `tournament_submissions_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_submissions` ADD CONSTRAINT `tournament_submissions_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_submissions` ADD CONSTRAINT `tournament_submissions_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_reviews` ADD CONSTRAINT `tournament_reviews_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `tournament_submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_reviews` ADD CONSTRAINT `tournament_reviews_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `tournament_submissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_published_by_fkey` FOREIGN KEY (`published_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_games` ADD CONSTRAINT `user_games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_games` ADD CONSTRAINT `user_games_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
