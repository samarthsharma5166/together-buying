-- RenameTable
RENAME TABLE `blogs` TO `articles`;

-- RenameIndex
ALTER TABLE `articles` RENAME INDEX `blogs_slug_key` TO `articles_slug_key`;

-- RenameForeignKey
ALTER TABLE `articles` DROP FOREIGN KEY `blogs_author_id_fkey`;
ALTER TABLE `articles` ADD CONSTRAINT `articles_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
