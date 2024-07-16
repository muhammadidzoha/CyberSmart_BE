/*
  Warnings:

  - Added the required column `urlAkte` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlKK` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlKTPAyah` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlKTPIbu` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlKTPMeninggal` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlPengantar` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlSuratKelahiran` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlSuratKematian` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlSuratNikah` to the `LetterRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `letterrequest` ADD COLUMN `urlAkte` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlKK` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlKTPAyah` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlKTPIbu` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlKTPMeninggal` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlKTPPemohon` VARCHAR(191) NULL,
    ADD COLUMN `urlPengantar` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlSuratKelahiran` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlSuratKematian` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlSuratNikah` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
