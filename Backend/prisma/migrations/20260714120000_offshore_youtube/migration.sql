-- AlterTable
ALTER TABLE `properties` ADD COLUMN `is_offshore` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `showcase_videos` MODIFY `poster_url` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `youtube_channel_config` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `channel_name` VARCHAR(191) NOT NULL,
    `channel_url` VARCHAR(191) NOT NULL,
    `metadata_text` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
