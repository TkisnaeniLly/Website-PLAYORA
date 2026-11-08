-- AlterTable
ALTER TABLE `games` ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `token_version` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `games_status_idx` ON `games`(`status`);

-- Backfill: game yang sudah ada sebelum kolom `status` diperkenalkan sudah tayang
-- untuk publik, jadi harus tetap PUBLISHED setelah migrasi. Tanpa baris ini,
-- seluruh katalog lama akan hilang dari halaman publik.
UPDATE `games` SET `status` = 'PUBLISHED';
