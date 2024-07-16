/*
  Warnings:

  - Added the required column `letter_number` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `letterrequest` ADD COLUMN `letter_number` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
