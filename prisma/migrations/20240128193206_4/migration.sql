/*
  Warnings:

  - Added the required column `urlToPdfFile` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Made the column `pdf_file` on table `letterrequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `letterrequest` ADD COLUMN `urlToPdfFile` VARCHAR(191) NOT NULL,
    MODIFY `pdf_file` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
