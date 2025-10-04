-- Add title column to posts table
ALTER TABLE posts ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Untitled';

-- Update existing rows to have meaningful titles
UPDATE posts SET title = CASE 
    WHEN LENGTH(content) > 50 THEN SUBSTRING(content, 1, 50) || '...'
    ELSE content
END
WHERE title = 'Untitled';
