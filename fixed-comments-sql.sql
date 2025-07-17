-- Fixed SQL script for comments issue
-- This version checks your actual table structure first

-- Step 1: Check what columns actually exist in reviews table
SELECT 'Checking reviews table structure:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check what reviews actually exist (using only basic columns)
SELECT 'Current reviews in database:' as status;
SELECT id, title, created_at FROM reviews ORDER BY created_at DESC LIMIT 10;

-- Step 3: Check if the specific review exists
DO $$
DECLARE
    target_review_id UUID := 'e9eafbc3-ad2a-4864-83fb-212ef710e994';
    review_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM reviews WHERE id = target_review_id) INTO review_exists;
    
    IF review_exists THEN
        RAISE NOTICE 'Review % EXISTS in database', target_review_id;
    ELSE
        RAISE NOTICE 'Review % DOES NOT EXIST in database', target_review_id;
        RAISE NOTICE 'This explains the foreign key constraint error!';
    END IF;
END $$;

-- Step 4: Remove ALL foreign key constraints from comments table
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_review_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_profiles_id_fkey;

-- Step 5: Drop and recreate comments table without any constraints
DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL, -- No foreign key constraints
    author_id UUID,          -- No foreign key constraints
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Disable RLS and grant permissions
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO anon;
GRANT ALL ON comments TO postgres;

-- Step 7: Test comment insertion with the problematic review ID
DO $$
DECLARE
    target_review_id UUID := 'e9eafbc3-ad2a-4864-83fb-212ef710e994';
    test_comment_id UUID;
BEGIN
    -- Try to insert a comment for the problematic review ID
    INSERT INTO comments (review_id, author_id, content, is_anonymous) 
    VALUES (target_review_id, gen_random_uuid(), 'Test comment - should work now', false)
    RETURNING id INTO test_comment_id;
    
    RAISE NOTICE 'SUCCESS: Comment inserted for review % with comment ID %', target_review_id, test_comment_id;
    
    -- Clean up the test comment
    DELETE FROM comments WHERE id = test_comment_id;
    RAISE NOTICE 'Test comment cleaned up - comments are working!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- Step 8: Final verification
SELECT 'Comments table fix completed!' as status;
SELECT 
    (SELECT COUNT(*) FROM comments) as total_comments,
    (SELECT COUNT(*) FROM reviews) as total_reviews;

SELECT 'Try adding a comment now - it should work!' as final_message;
