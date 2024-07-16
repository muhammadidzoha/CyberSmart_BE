/*
  Warnings:

  - Added the required column `file_KTPAyah` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_KTPIbu` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_KTPMeninggal` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_akte` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_kk` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_pengantar` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_suratKelahiran` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_suratKematian` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_suratNikah` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `letterrequest` ADD COLUMN `file_KTPAyah` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_KTPIbu` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_KTPMeninggal` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_KTPPemohon` VARCHAR(191) NULL,
    ADD COLUMN `file_akte` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_kk` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_pengantar` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_suratKelahiran` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_suratKematian` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_suratNikah` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
