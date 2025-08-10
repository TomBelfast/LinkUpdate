-- Dodaj kolumnę user_id do tabeli links
ALTER TABLE links ADD COLUMN user_id VARCHAR(36) NULL;

-- Zaktualizuj statusy w tabeli ideas
UPDATE ideas SET status = 'pending' WHERE status = 'DRAFT';
UPDATE ideas SET status = 'in_progress' WHERE status = 'ACTIVE';
UPDATE ideas SET status = 'completed' WHERE status = 'ARCHIVED';

-- Zmień typ kolumny status w tabeli ideas
ALTER TABLE ideas MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'rejected') DEFAULT 'pending';