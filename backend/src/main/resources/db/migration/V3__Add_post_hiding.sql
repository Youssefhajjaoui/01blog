-- Add hidden and hide_reason columns to posts table if they don't exist
DO $$
BEGIN
    -- Add hidden column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'hidden'
    ) THEN
        ALTER TABLE posts ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    -- Add hide_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'hide_reason'
    ) THEN
        ALTER TABLE posts ADD COLUMN hide_reason TEXT;
    END IF;
END $$;

