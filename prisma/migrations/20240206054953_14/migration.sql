/*
  Warnings:

  - You are about to drop the column `tempat` on the `userklien` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` DROP COLUMN `tempat`,
    ADD COLUMN `place` VARCHAR(191) NULL,
    MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
