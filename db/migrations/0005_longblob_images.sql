-- Zwiększ limit pakietów MySQL
SET GLOBAL max_allowed_packet = 1073741824; -- 1GB

-- Zmień typ kolumn na LONGBLOB
ALTER TABLE links MODIFY COLUMN image_data LONGBLOB;
ALTER TABLE links MODIFY COLUMN thumbnail_data LONGBLOB;

-- Zwiększ timeout dla długich operacji
SET SESSION wait_timeout = 28800; -- 8 godzin
SET SESSION interactive_timeout = 28800; 