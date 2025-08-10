-- Utworzenie bazy danych
CREATE DATABASE IF NOT EXISTS ToDo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utworzenie użytkownika i nadanie uprawnień
CREATE USER IF NOT EXISTS 'testToDo'@'%' IDENTIFIED BY 'testToDo';
GRANT ALL PRIVILEGES ON ToDo.* TO 'testToDo'@'%';
FLUSH PRIVILEGES;

-- Użycie bazy danych
USE ToDo;

-- Tabela users (musi być pierwsza ze względu na klucze obce)
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(36) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` timestamp NULL,
  `image` text,
  `password` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` varchar(36) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` ENUM('ACTIVE', 'PAUSED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
  `color` varchar(7),
  `icon` varchar(50),
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `user_id_idx` (`user_id`),
  KEY `status_idx` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` varchar(36) PRIMARY KEY,
  `description` text NOT NULL,
  `status` ENUM('NEW', 'IN_PROGRESS', 'PENDING_FEEDBACK', 'COMPLETED') NOT NULL DEFAULT 'NEW',
  `due_date` timestamp NULL,
  `project_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assigned_to` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `project_id_idx` (`project_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `status_idx` (`status`),
  FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`assigned_to`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 