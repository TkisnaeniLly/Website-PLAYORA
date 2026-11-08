-- CreateTable
CREATE TABLE `discord_rooms` (
    `id` CHAR(36) NOT NULL,
    `submitted_by` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `invite_url` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `game_id` CHAR(36) NULL,
    `member_count` INTEGER NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `admin_note` TEXT NULL,
    `reviewed_by` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `discord_rooms_invite_url_key`(`invite_url`),
    INDEX `discord_rooms_status_created_at_idx`(`status`, `created_at`),
    INDEX `discord_rooms_submitted_by_idx`(`submitted_by`),
    INDEX `discord_rooms_game_id_idx`(`game_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `discord_rooms` ADD CONSTRAINT `discord_rooms_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discord_rooms` ADD CONSTRAINT `discord_rooms_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discord_rooms` ADD CONSTRAINT `discord_rooms_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterEnum: tambah tipe notifikasi keputusan ruang Discord.
ALTER TABLE `notifications` MODIFY COLUMN `type` ENUM('SUBMISSION_CREATED','SUBMISSION_STATUS_CHANGED','SUBMISSION_APPROVED','SUBMISSION_REJECTED','SUBMISSION_NEEDS_REVISION','RESULT_APPROVED','RESULT_REJECTED','CHANGE_REQUEST_APPROVED','CHANGE_REQUEST_REJECTED','DISCORD_ROOM_APPROVED','DISCORD_ROOM_REJECTED') NOT NULL;
