/*
  Warnings:

  - You are about to drop the column `status` on the `destination` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `news` table. All the data in the column will be lost.
  - Added the required column `content` to the `Destination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `destination` DROP COLUMN `status`,
    ADD COLUMN `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `status`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
