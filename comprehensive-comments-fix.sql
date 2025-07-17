-- Comprehensive fix for comments functionality
-- Run this in your Supabase SQL Editor

-- First, let's check what we have
SELECT 'Checking current database state...' as status;

-- Check if reviews table exists and has data
DO $$
DECLARE
    review_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO review_count FROM reviews;
    RAISE NOTICE 'Found % reviews in database', review_count;
    
    IF review_count = 0 THEN
        RAISE NOTICE 'WARNING: No reviews found! You may need to create some sample data first.';
    END IF;
END $$;

-- Drop and recreate comments table to ensure clean state
DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL,
    author_id UUID,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add foreign key constraint to reviews table
    CONSTRAINT comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_comments_review_id ON comments(review_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for comments
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
GRANT USAGE ON SEQUENCE comments_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE comments_id_seq TO anon;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Test the setup
DO $$
DECLARE
    test_review_id UUID;
    test_comment_id UUID;
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Get a review ID for testing
    SELECT id INTO test_review_id FROM reviews LIMIT 1;
    
    IF test_review_id IS NOT NULL THEN
        -- Test 1: Insert a regular comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous) 
        VALUES (test_review_id, test_user_id, 'Test comment - regular user', false)
        RETURNING id INTO test_comment_id;
        
        RAISE NOTICE 'Test comment 1 inserted successfully with ID: %', test_comment_id;
        DELETE FROM comments WHERE id = test_comment_id;
        
        -- Test 2: Insert an anonymous comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous) 
        VALUES (test_review_id, NULL, 'Test comment - anonymous', true)
        RETURNING id INTO test_comment_id;
        
        RAISE NOTICE 'Test comment 2 (anonymous) inserted successfully with ID: %', test_comment_id;
        DELETE FROM comments WHERE id = test_comment_id;
        
        RAISE NOTICE 'All tests passed! Comments table is working correctly.';
    ELSE
        RAISE NOTICE 'No reviews found for testing. Please create some reviews first.';
        RAISE NOTICE 'You can use the "Create Sample Data" button in your app.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test failed: %', SQLERRM;
        RAISE NOTICE 'This might indicate a problem with the reviews table or other dependencies.';
END $$;

-- Final verification
SELECT 
    'Comments table setup completed!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'comments') as table_exists,
    (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'comments' AND constraint_type = 'FOREIGN KEY') as foreign_keys,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'comments') as policies;

-- Show table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;
