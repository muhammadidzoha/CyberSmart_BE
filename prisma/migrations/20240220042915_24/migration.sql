/*
  Warnings:

  - You are about to drop the column `file_suratKelahiran` on the `letterrequest` table. All the data in the column will be lost.
  - You are about to drop the column `file_suratKematian` on the `letterrequest` table. All the data in the column will be lost.
  - You are about to drop the column `urlSuratKelahiran` on the `letterrequest` table. All the data in the column will be lost.
  - You are about to drop the column `urlSuratKematian` on the `letterrequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `letterrequest` DROP COLUMN `file_suratKelahiran`,
    DROP COLUMN `file_suratKematian`,
    DROP COLUMN `urlSuratKelahiran`,
    DROP COLUMN `urlSuratKematian`;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
