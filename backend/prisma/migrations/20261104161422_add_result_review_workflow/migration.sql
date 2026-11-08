-- AlterTable
ALTER TABLE `tournament_results` ADD COLUMN `admin_note` TEXT NULL,
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
    ADD COLUMN `reviewed_by` CHAR(36) NULL,
    ADD COLUMN `status` ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_REVIEW',
    ADD COLUMN `submitted_by` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `tournament_result_reviews` (
    `id` CHAR(36) NOT NULL,
    `result_id` CHAR(36) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `action` ENUM('SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tournament_result_reviews_result_id_created_at_idx`(`result_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `tournament_results_tournament_id_status_idx` ON `tournament_results`(`tournament_id`, `status`);

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_result_reviews` ADD CONSTRAINT `tournament_result_reviews_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `tournament_results`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_result_reviews` ADD CONSTRAINT `tournament_result_reviews_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: hasil yang sudah ada sebelum alur review diperkenalkan sudah tayang publik,
-- sehingga harus tetap APPROVED. Tanpa baris ini, halaman detail turnamen kehilangan hasil.
UPDATE `tournament_results` SET `status` = 'APPROVED' WHERE `status` = 'PENDING_REVIEW';
