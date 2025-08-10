ALTER TABLE `ideas` MODIFY COLUMN `id` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `ideas` MODIFY COLUMN `status` enum('DRAFT','ACTIVE','ARCHIVED') DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE `ideas` MODIFY COLUMN `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `ideas` MODIFY COLUMN `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `ideas` ADD `user_id` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `ideas` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `links` ADD `user_id` varchar(36);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `ideas` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `ideas` (`status`);--> statement-breakpoint
ALTER TABLE `ideas` ADD CONSTRAINT `ideas_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;