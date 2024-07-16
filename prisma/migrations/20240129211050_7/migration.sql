-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- CreateTable
CREATE TABLE `Transparency` (
    `transparency_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `date_of_publication` DATE NOT NULL,
    `apbd_file` VARCHAR(191) NOT NULL,
    `urlToApbdFile` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    PRIMARY KEY (`transparency_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transparency` ADD CONSTRAINT `Transparency_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `UserAdmin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
