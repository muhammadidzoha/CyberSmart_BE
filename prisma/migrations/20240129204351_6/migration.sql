-- AlterTable
ALTER TABLE `letterrequest` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `useradmin` MODIFY `refresh_token` TEXT NULL DEFAULT null;

-- AlterTable
ALTER TABLE `userklien` MODIFY `otp` TEXT NULL DEFAULT null,
    MODIFY `refresh_token` TEXT NULL DEFAULT null;
