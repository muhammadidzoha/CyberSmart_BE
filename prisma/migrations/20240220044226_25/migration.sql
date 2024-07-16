-- AlterTable
ALTER TABLE `letterrequest` ADD COLUMN `file_suratKelahiran` VARCHAR(191) NULL,
    ADD COLUMN `file_suratKematian` VARCHAR(191) NULL,
    ADD COLUMN `urlSuratKelahiran` VARCHAR(191) NULL,
    ADD COLUMN `urlSuratKematian` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
