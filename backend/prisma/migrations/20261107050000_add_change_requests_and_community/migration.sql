-- CreateTable
CREATE TABLE `tournament_change_requests` (
    `id` CHAR(36) NOT NULL,
    `tournament_id` CHAR(36) NOT NULL,
    `requested_by` CHAR(36) NOT NULL,
    `payload` TEXT NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewed_by` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `admin_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tournament_change_requests_tournament_id_status_idx`(`tournament_id`, `status`),
    INDEX `tournament_change_requests_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_posts` (
    `id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `category` ENUM('DISKUSI', 'TIPS', 'TURNAMEN', 'REKOMENDASI', 'EVENT') NOT NULL DEFAULT 'DISKUSI',
    `image_url` VARCHAR(500) NULL,
    `is_hidden` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `community_posts_is_hidden_created_at_idx`(`is_hidden`, `created_at`),
    INDEX `community_posts_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_comments` (
    `id` CHAR(36) NOT NULL,
    `post_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `body` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `community_comments_post_id_created_at_idx`(`post_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_post_likes` (
    `post_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `community_post_likes_user_id_idx`(`user_id`),
    PRIMARY KEY (`post_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_change_requests` ADD CONSTRAINT `tournament_change_requests_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_change_requests` ADD CONSTRAINT `tournament_change_requests_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_change_requests` ADD CONSTRAINT `tournament_change_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_posts` ADD CONSTRAINT `community_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_comments` ADD CONSTRAINT `community_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_comments` ADD CONSTRAINT `community_comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_post_likes` ADD CONSTRAINT `community_post_likes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_post_likes` ADD CONSTRAINT `community_post_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
