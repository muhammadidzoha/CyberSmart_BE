-- AlterTable
ALTER TABLE `letterrequest` MODIFY `file_KTPAyah` VARCHAR(191) NULL,
    MODIFY `file_KTPIbu` VARCHAR(191) NULL,
    MODIFY `file_KTPMeninggal` VARCHAR(191) NULL,
    MODIFY `file_akte` VARCHAR(191) NULL,
    MODIFY `file_kk` VARCHAR(191) NULL,
    MODIFY `file_pengantar` VARCHAR(191) NULL,
    MODIFY `file_suratKelahiran` VARCHAR(191) NULL,
    MODIFY `file_suratKematian` VARCHAR(191) NULL,
    MODIFY `file_suratNikah` VARCHAR(191) NULL,
    MODIFY `urlAkte` VARCHAR(191) NULL,
    MODIFY `urlKK` VARCHAR(191) NULL,
    MODIFY `urlKTPAyah` VARCHAR(191) NULL,
    MODIFY `urlKTPIbu` VARCHAR(191) NULL,
    MODIFY `urlKTPMeninggal` VARCHAR(191) NULL,
    MODIFY `urlPengantar` VARCHAR(191) NULL,
    MODIFY `urlSuratKelahiran` VARCHAR(191) NULL,
    MODIFY `urlSuratKematian` VARCHAR(191) NULL,
    MODIFY `urlSuratNikah` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
