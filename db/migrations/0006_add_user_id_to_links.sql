-- Add user_id column to links table
ALTER TABLE links ADD COLUMN user_id VARCHAR(36) NULL;

-- Add index for better performance on user_id queries
CREATE INDEX idx_links_user_id ON links(user_id);