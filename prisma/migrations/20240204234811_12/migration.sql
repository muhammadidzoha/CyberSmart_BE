-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- CreateTable
CREATE TABLE `Comentar` (
    `id` VARCHAR(191) NOT NULL,
    `comment_content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `newsId` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comentar` ADD CONSTRAINT `Comentar_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `News`(`news_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentar` ADD CONSTRAINT `Comentar_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `UserKlien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
