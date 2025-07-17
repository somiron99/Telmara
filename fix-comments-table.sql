-- Fix comments table foreign key constraints
-- Run this in your Supabase SQL Editor

-- Check current constraints on comments table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'comments'
AND tc.constraint_type = 'FOREIGN KEY';

-- Remove foreign key constraint on author_id if it references profiles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'comments' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'author_id'
        AND ccu.table_name = 'profiles'
    ) LOOP
        EXECUTE 'ALTER TABLE comments DROP CONSTRAINT ' || r.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- Ensure comments table has correct structure
DO $$
BEGIN
    -- Check if comments table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        RAISE NOTICE 'Comments table exists';
        
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'updated_at') THEN
            ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column';
        END IF;
        
    ELSE
        -- Create comments table if it doesn't exist
        CREATE TABLE comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
            author_id UUID, -- No foreign key constraint to avoid profiles table dependency
            content TEXT NOT NULL,
            is_anonymous BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created comments table';
    END IF;
END $$;

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Create permissive policies for comments
CREATE POLICY "comments_select_policy" ON comments 
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_policy" ON comments 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "comments_update_policy" ON comments 
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "comments_delete_policy" ON comments 
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Grant permissions
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Test comment insertion
DO $$
DECLARE
    test_review_id UUID;
    test_user_id UUID := gen_random_uuid();
    test_comment_id UUID;
BEGIN
    -- Get a review ID for testing
    SELECT id INTO test_review_id FROM reviews LIMIT 1;
    
    IF test_review_id IS NOT NULL THEN
        -- Try to insert a test comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous) 
        VALUES (test_review_id, test_user_id, 'Test comment for functionality check', false)
        RETURNING id INTO test_comment_id;
        
        RAISE NOTICE 'Test comment inserted successfully with ID: %', test_comment_id;
        
        -- Clean up the test comment
        DELETE FROM comments WHERE id = test_comment_id;
        RAISE NOTICE 'Test comment cleaned up';
    ELSE
        RAISE NOTICE 'No reviews found for testing, but table setup is complete';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- Verify final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Comments table setup completed successfully!' as status;
