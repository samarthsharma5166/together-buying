/*
  Warnings:

  - You are about to alter the column `company_name` on the `developers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `slug` on the `developers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `contact_email` on the `developers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `slug` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `latitude` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,8)` to `Decimal(65,30)`.
  - You are about to alter the column `longitude` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `Decimal(11,8)` to `Decimal(65,30)`.
  - You are about to alter the column `metaTitle` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `caption` on the `property_images` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `carpetAreaSqft` on the `property_units` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(65,30)`.
  - You are about to alter the column `superAreaSqft` on the `property_units` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(65,30)`.
  - You are about to alter the column `caption` on the `unit_images` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `password_hash` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `developers` MODIFY `company_name` VARCHAR(191) NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL,
    MODIFY `logo_url` VARCHAR(191) NULL,
    MODIFY `banner_image_url` VARCHAR(191) NULL,
    MODIFY `contact_name` VARCHAR(191) NOT NULL,
    MODIFY `contact_email` VARCHAR(191) NOT NULL,
    MODIFY `contact_phone` VARCHAR(191) NOT NULL,
    MODIFY `website_url` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `headquarters_city` VARCHAR(191) NULL,
    MODIFY `partnership_start` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `properties` ADD COLUMN `amenities` VARCHAR(191) NULL,
    ADD COLUMN `highlights` VARCHAR(191) NULL,
    ADD COLUMN `is_fast_selling` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_promising` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `specifications` VARCHAR(191) NULL,
    MODIFY `title` VARCHAR(191) NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `city` VARCHAR(191) NOT NULL,
    MODIFY `locality` VARCHAR(191) NOT NULL,
    MODIFY `address` VARCHAR(191) NOT NULL,
    MODIFY `latitude` DECIMAL(65, 30) NULL,
    MODIFY `longitude` DECIMAL(65, 30) NULL,
    MODIFY `reraNumber` VARCHAR(191) NOT NULL,
    MODIFY `reraState` VARCHAR(191) NOT NULL,
    MODIFY `possessionDate` DATETIME(3) NULL,
    MODIFY `metaTitle` VARCHAR(191) NULL,
    MODIFY `metaDescription` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `property_images` MODIFY `imageUrl` VARCHAR(191) NOT NULL,
    MODIFY `caption` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `property_units` MODIFY `carpetAreaSqft` DECIMAL(65, 30) NOT NULL,
    MODIFY `superAreaSqft` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `unit_images` MODIFY `imageUrl` VARCHAR(191) NOT NULL,
    MODIFY `caption` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `first_name` VARCHAR(191) NOT NULL,
    MODIFY `last_name` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL,
    MODIFY `password_hash` VARCHAR(191) NOT NULL,
    MODIFY `address_line_1` VARCHAR(191) NULL,
    MODIFY `address_line_2` VARCHAR(191) NULL,
    MODIFY `city` VARCHAR(191) NULL,
    MODIFY `state` VARCHAR(191) NULL,
    MODIFY `pincode` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `property_groups` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('GROUP_FORMING', 'GROUP_ACTIVE', 'NEGOTIATING_WITH_DEVELOPER', 'DEVELOPER_AGREED', 'SOLD_OUT', 'CANCELLED') NOT NULL,
    `min_group_size` INTEGER NOT NULL,
    `target_group_size` INTEGER NOT NULL,
    `target_discount` DOUBLE NOT NULL,
    `current_members` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_members` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `group_members_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFE_TIME') NOT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL,
    `planId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transections` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hero_slides` (
    `id` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `tag_label` VARCHAR(191) NOT NULL DEFAULT 'We''ve saved',
    `tag_amount` VARCHAR(191) NOT NULL DEFAULT '₹25Cr+',
    `tag_subtext` VARCHAR(191) NOT NULL DEFAULT 'for 150+ families',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `showcase_videos` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `video_url` VARCHAR(191) NOT NULL,
    `poster_url` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `property_groups` ADD CONSTRAINT `property_groups_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_groups` ADD CONSTRAINT `property_groups_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `property_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transections` ADD CONSTRAINT `transections_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
