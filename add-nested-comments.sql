-- Add nested comments support (run AFTER the main script)
-- This adds reply functionality to comments

-- Step 1: Add parent_comment_id column for nested replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Step 3: Grant permissions
GRANT ALL ON comments TO authenticated, anon, postgres;

-- Step 4: Test nested comments
DO $$
DECLARE
    test_review_id UUID;
    test_comment_id UUID;
    test_reply_id UUID;
    test_user_id UUID := gen_random_uuid();
    test_user_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get a test review
    SELECT id INTO test_review_id FROM reviews LIMIT 1;

    IF test_review_id IS NOT NULL THEN
        -- Add a top-level comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous, parent_comment_id)
        VALUES (test_review_id, test_user_id, 'This is a top-level comment for testing', false, NULL)
        RETURNING id INTO test_comment_id;

        -- Add a reply to the comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous, parent_comment_id)
        VALUES (test_review_id, test_user_id_2, 'This is a reply to the comment above', false, test_comment_id)
        RETURNING id INTO test_reply_id;

        RAISE NOTICE 'SUCCESS: Nested comment test completed';
        RAISE NOTICE 'Top-level comment ID: %', test_comment_id;
        RAISE NOTICE 'Reply comment ID: %', test_reply_id;

        -- Clean up test data
        DELETE FROM comments WHERE id IN (test_comment_id, test_reply_id);
        RAISE NOTICE 'Test data cleaned up';
    ELSE
        RAISE NOTICE 'No reviews found for testing nested comments';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Nested comments test failed: %', SQLERRM;
END $$;

-- Final status
SELECT 'Nested comments support added successfully!' as status;
