CREATE TABLE `ideas` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` timestamp,
	`image` text,
	`password` text,
	`credits` int NOT NULL DEFAULT 0,
	`advanced` int NOT NULL DEFAULT 0,
	`subscribed` boolean NOT NULL DEFAULT false,
	`paid` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('ACTIVE','PAUSED','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
	`priority` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
	`color` varchar(7),
	`icon` varchar(50),
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL,
	`description` text NOT NULL,
	`status` enum('NEW','IN_PROGRESS','PENDING_FEEDBACK','COMPLETED') NOT NULL DEFAULT 'NEW',
	`due_date` timestamp,
	`project_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`assigned_to` varchar(36),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `image_data` binary(255);--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `image_mime_type` varchar(50);--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `thumbnail_data` binary(255);--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `thumbnail_mime_type` varchar(50);--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `created_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `updated_at` timestamp NOT NULL;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `projects` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `tasks` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigned_to_user_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;