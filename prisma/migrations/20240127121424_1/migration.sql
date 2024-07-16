-- CreateTable
CREATE TABLE `UserKlien` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nik` BIGINT NULL,
    `gender` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `village` VARCHAR(191) NULL,
    `zipcode` INTEGER NULL,
    `rt` VARCHAR(191) NULL,
    `rw` VARCHAR(191) NULL,
    `birthday` DATE NULL,
    `job` VARCHAR(191) NULL,
    `education` VARCHAR(191) NULL,
    `religion` VARCHAR(191) NULL,
    `otp` TEXT NULL DEFAULT null,
    `refresh_token` TEXT NULL DEFAULT null,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAdmin` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL DEFAULT null,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `News` (
    `news_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NOT NULL,
    `urlToThumbnail` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `views` BIGINT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    PRIMARY KEY (`news_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destination` (
    `destination_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `urlToImage` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `views` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    PRIMARY KEY (`destination_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LetterRequest` (
    `request_id` VARCHAR(191) NOT NULL,
    `letter_type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'null',
    `pdf_file` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `UserAdmin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Destination` ADD CONSTRAINT `Destination_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `UserAdmin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterRequest` ADD CONSTRAINT `LetterRequest_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `UserKlien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
