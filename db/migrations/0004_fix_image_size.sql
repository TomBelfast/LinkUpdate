-- Zmiana typu kolumn na LONGBLOB
ALTER TABLE links MODIFY COLUMN image_data LONGBLOB;
ALTER TABLE links MODIFY COLUMN thumbnail_data LONGBLOB;

-- Zwiększenie maksymalnego rozmiaru pakietu MySQL
SET GLOBAL max_allowed_packet = 67108864; -- 64MB 