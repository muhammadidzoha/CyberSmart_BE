/*
  Warnings:

  - You are about to drop the `lettertype` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `lettertype` DROP FOREIGN KEY `LetterType_authorId_fkey`;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` ADD COLUMN `tempat` VARCHAR(191) NULL,
    MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- DropTable
DROP TABLE `lettertype`;
