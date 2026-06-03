/*
  Warnings:

  - The values [DEVELOPER] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('USER', 'BUYER_PREMIUM', 'RM', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `developerId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `propertyType` ENUM('RESIDENTIAL', 'COMMERCIAL') NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'SOLD_OUT', 'ARCHIVED') NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `locality` VARCHAR(100) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `reraNumber` VARCHAR(100) NOT NULL,
    `reraState` VARCHAR(50) NOT NULL,
    `possessionDate` DATE NULL,
    `possessionStatus` ENUM('PRE_LAUNCH', 'UNDER_CONSTRUCTION', 'READY_TO_MOVE') NOT NULL,
    `minPrice` BIGINT NOT NULL,
    `maxPrice` BIGINT NOT NULL,
    `totalUnits` INTEGER NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isPreLaunch` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `properties_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_images` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `caption` VARCHAR(255) NULL,
    `imageType` ENUM('EXTERIOR', 'AMENITY', 'LOCATION_MAP', 'CONSTRUCTION_UPDATE', 'MASTER_PLAN') NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_units` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `unitType` ENUM('BHK_1', 'BHK_2', 'BHK_3', 'BHK_4', 'BHK_5', 'VILLA', 'PLOT', 'OFFICE', 'SHOP') NOT NULL,
    `carpetAreaSqft` DECIMAL(8, 2) NOT NULL,
    `superAreaSqft` DECIMAL(8, 2) NULL,
    `price` BIGINT NOT NULL,
    `availableUnits` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_images` (
    `id` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `imageType` ENUM('FLOOR_PLAN', 'INTERIOR', 'BALCONY', 'KITCHEN', 'BEDROOM', 'LIVING_ROOM') NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `developers` (
    `id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `logo_url` TEXT NULL,
    `banner_image_url` TEXT NULL,
    `contact_name` VARCHAR(100) NOT NULL,
    `contact_email` VARCHAR(255) NOT NULL,
    `contact_phone` VARCHAR(15) NOT NULL,
    `website_url` TEXT NULL,
    `established_year` INTEGER NULL,
    `description` TEXT NULL,
    `headquarters_city` VARCHAR(100) NULL,
    `rera_registered` BOOLEAN NOT NULL DEFAULT false,
    `partnership_status` ENUM('ACTIVE', 'PAUSED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `partnership_start` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `developers_slug_key`(`slug`),
    UNIQUE INDEX `developers_contact_email_key`(`contact_email`),
    UNIQUE INDEX `developers_contact_phone_key`(`contact_phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_developerId_fkey` FOREIGN KEY (`developerId`) REFERENCES `developers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_images` ADD CONSTRAINT `property_images_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_units` ADD CONSTRAINT `property_units_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit_images` ADD CONSTRAINT `unit_images_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `property_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
