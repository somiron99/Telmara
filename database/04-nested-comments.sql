-- Add nested comments support (replies to comments)
-- Run this AFTER the complete-fix-all-features.sql script

-- Step 1: Add parent_comment_id to comments table for nested replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Step 2: Create index for nested comments
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Step 3: Create a recursive function to get comment threads
CREATE OR REPLACE FUNCTION get_comment_thread(review_uuid UUID)
RETURNS TABLE (
    id UUID,
    review_id UUID,
    parent_comment_id UUID,
    author_id UUID,
    content TEXT,
    is_anonymous BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE comment_tree AS (
        -- Base case: top-level comments (no parent)
        SELECT 
            c.id,
            c.review_id,
            c.parent_comment_id,
            c.author_id,
            c.content,
            c.is_anonymous,
            c.created_at,
            c.updated_at,
            0 as level
        FROM comments c
        WHERE c.review_id = review_uuid 
        AND c.parent_comment_id IS NULL
        
        UNION ALL
        
        -- Recursive case: replies to comments
        SELECT 
            c.id,
            c.review_id,
            c.parent_comment_id,
            c.author_id,
            c.content,
            c.is_anonymous,
            c.created_at,
            c.updated_at,
            ct.level + 1
        FROM comments c
        INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
    )
    SELECT * FROM comment_tree
    ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Test the nested comments functionality
DO $$
DECLARE
    test_company_id UUID;
    test_review_id UUID;
    test_comment_id UUID;
    test_reply_id UUID;
    test_user_id UUID := gen_random_uuid();
    test_user_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get or create a test company
    SELECT id INTO test_company_id FROM companies LIMIT 1;
    
    IF test_company_id IS NULL THEN
        INSERT INTO companies (name, slug, industry, location, size, description, website)
        VALUES ('Test Company for Comments', 'test-company-comments', 'Technology', 'Test City', '1-50', 'Test company', 'https://test.com')
        RETURNING id INTO test_company_id;
    END IF;
    
    -- Create a test review
    INSERT INTO reviews (
        company_id, author_id, title, content, rating,
        position, department, employment_type, work_location,
        is_anonymous, is_current_employee
    ) VALUES (
        test_company_id, test_user_id, 'Test Review for Comments', 'Testing nested comments functionality',
        4, 'Test Position', 'Test Dept', 'full-time', 'remote',
        false, true
    ) RETURNING id INTO test_review_id;
    
    -- Add a top-level comment
    INSERT INTO comments (review_id, author_id, content, is_anonymous, parent_comment_id)
    VALUES (test_review_id, test_user_id, 'This is a top-level comment', false, NULL)
    RETURNING id INTO test_comment_id;
    
    -- Add a reply to the comment
    INSERT INTO comments (review_id, author_id, content, is_anonymous, parent_comment_id)
    VALUES (test_review_id, test_user_id_2, 'This is a reply to the comment', false, test_comment_id)
    RETURNING id INTO test_reply_id;
    
    -- Test the recursive function
    PERFORM * FROM get_comment_thread(test_review_id);
    
    RAISE NOTICE 'SUCCESS: Nested comments test completed';
    RAISE NOTICE 'Top-level comment ID: %', test_comment_id;
    RAISE NOTICE 'Reply comment ID: %', test_reply_id;
    
    -- Clean up test data
    DELETE FROM comments WHERE review_id = test_review_id;
    DELETE FROM reviews WHERE id = test_review_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Nested comments test failed: %', SQLERRM;
END $$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION get_comment_thread(UUID) TO authenticated, anon;

-- Final status
SELECT 'Nested comments support added successfully!' as status;
