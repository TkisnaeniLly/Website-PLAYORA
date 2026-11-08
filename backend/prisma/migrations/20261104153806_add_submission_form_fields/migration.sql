-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('SUBMISSION_CREATED', 'SUBMISSION_STATUS_CHANGED', 'SUBMISSION_APPROVED', 'SUBMISSION_REJECTED', 'SUBMISSION_NEEDS_REVISION') NOT NULL;

-- AlterTable
ALTER TABLE `tournament_submissions` ADD COLUMN `registration_method` VARCHAR(100) NULL,
    ADD COLUMN `team_count` INTEGER NULL;

-- AlterTable
ALTER TABLE `tournaments` ADD COLUMN `registration_method` VARCHAR(100) NULL,
    ADD COLUMN `team_count` INTEGER NULL;
