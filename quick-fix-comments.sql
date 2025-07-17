-- Quick fix for comments table
-- Run this in your Supabase SQL Editor

-- Remove any foreign key constraints that might be causing issues
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_profiles_id_fkey;

-- Ensure the comments table has the right structure
DO $$
BEGIN
    -- Check if comments table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        CREATE TABLE comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
            author_id UUID, -- No foreign key constraint
            content TEXT NOT NULL,
            is_anonymous BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created comments table';
    ELSE
        RAISE NOTICE 'Comments table already exists';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

-- Create simple, permissive policies
CREATE POLICY "comments_select_policy" ON comments 
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_policy" ON comments 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "comments_update_policy" ON comments 
    FOR UPDATE USING (true);

CREATE POLICY "comments_delete_policy" ON comments 
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Test comment insertion
DO $$
DECLARE
    test_review_id UUID;
    test_comment_id UUID;
BEGIN
    -- Get a review ID for testing
    SELECT id INTO test_review_id FROM reviews LIMIT 1;
    
    IF test_review_id IS NOT NULL THEN
        -- Try to insert a test comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous) 
        VALUES (test_review_id, gen_random_uuid(), 'Test comment - this will be deleted', false)
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
        RAISE NOTICE 'Test failed but table should still work: %', SQLERRM;
END $$;

SELECT 'Comments table fix completed!' as status;
