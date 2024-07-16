-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- CreateTable
CREATE TABLE `LetterType` (
    `letter_id` VARCHAR(191) NOT NULL,
    `letter_name` VARCHAR(191) NOT NULL,
    `letter_file` VARCHAR(191) NOT NULL,
    `urlToLetterFile` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    PRIMARY KEY (`letter_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LetterType` ADD CONSTRAINT `LetterType_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `UserAdmin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
