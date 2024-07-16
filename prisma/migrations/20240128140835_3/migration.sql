/*
  Warnings:

  - You are about to drop the column `category` on the `destination` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `news` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `destination` DROP COLUMN `category`;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `category`;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
