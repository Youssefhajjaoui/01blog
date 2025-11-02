-- Fix posts table to use TEXT instead of VARCHAR for content and hide_reason fields
-- This allows blog posts to have unlimited length content

-- Only alter if the column is currently VARCHAR(255), otherwise it's already TEXT
DO $$
BEGIN
    -- Fix content column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'content' 
        AND data_type = 'character varying' 
        AND character_maximum_length = 255
    ) THEN
        ALTER TABLE posts ALTER COLUMN content TYPE TEXT;
    END IF;
    
    -- Fix hide_reason column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'hide_reason' 
        AND data_type = 'character varying' 
        AND character_maximum_length = 255
    ) THEN
        ALTER TABLE posts ALTER COLUMN hide_reason TYPE TEXT;
    END IF;
END $$;
