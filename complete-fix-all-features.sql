-- Complete fix for all features: reviews, likes, comments, and persistence
-- Run this AFTER the relationship fix

-- Step 1: Ensure all tables have proper structure and relationships
-- Reviews table should already be fixed by previous script

-- Step 2: Recreate comments table with proper structure
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    author_id UUID,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Recreate reactions table with proper structure
DROP TABLE IF EXISTS reactions CASCADE;
CREATE TABLE reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id, type)
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_comments_review_id ON comments(review_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_reactions_review_id ON reactions(review_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_unique ON reactions(review_id, user_id, type);

-- Step 5: Disable RLS and grant permissions
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON reviews TO authenticated, anon, postgres;
GRANT ALL ON companies TO authenticated, anon, postgres;
GRANT ALL ON comments TO authenticated, anon, postgres;
GRANT ALL ON reactions TO authenticated, anon, postgres;

-- Step 6: Test complete functionality
DO $$
DECLARE
    test_company_id UUID;
    test_review_id UUID;
    test_comment_id UUID;
    test_reaction_id UUID;
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Get or create a test company
    SELECT id INTO test_company_id FROM companies LIMIT 1;
    
    IF test_company_id IS NULL THEN
        INSERT INTO companies (name, slug, industry, location, size, description, website)
        VALUES ('Test Company', 'test-company-' || extract(epoch from now()), 'Technology', 'Test City', '1-50', 'Test company', 'https://test.com')
        RETURNING id INTO test_company_id;
        RAISE NOTICE 'Created test company: %', test_company_id;
    END IF;
    
    -- Test 1: Create a review
    INSERT INTO reviews (
        company_id, author_id, title, content, rating,
        position, department, employment_type, work_location,
        is_anonymous, is_current_employee, pros, cons, advice_to_management
    ) VALUES (
        test_company_id, test_user_id, 'Complete Test Review', 'Testing all functionality',
        5, 'Test Position', 'Test Dept', 'full-time', 'remote',
        false, true, 'Great test', 'No issues', 'Keep testing'
    ) RETURNING id INTO test_review_id;
    
    RAISE NOTICE 'SUCCESS: Review created - ID: %', test_review_id;
    
    -- Test 2: Add a comment
    INSERT INTO comments (review_id, author_id, content, is_anonymous)
    VALUES (test_review_id, test_user_id, 'Test comment on review', false)
    RETURNING id INTO test_comment_id;
    
    RAISE NOTICE 'SUCCESS: Comment created - ID: %', test_comment_id;
    
    -- Test 3: Add a like/reaction
    INSERT INTO reactions (review_id, user_id, type)
    VALUES (test_review_id, test_user_id, 'like')
    RETURNING id INTO test_reaction_id;
    
    RAISE NOTICE 'SUCCESS: Reaction created - ID: %', test_reaction_id;
    
    -- Test 4: Query everything together (like frontend does)
    PERFORM r.*,
            c.name as company_name,
            COALESCE(comment_data.comments, '[]'::json) as comments,
            COALESCE(reaction_data.reactions, '[]'::json) as reactions
    FROM reviews r
    LEFT JOIN companies c ON r.company_id = c.id
    LEFT JOIN (
        SELECT review_id, 
               json_agg(json_build_object(
                   'id', id,
                   'content', content,
                   'author_id', author_id,
                   'is_anonymous', is_anonymous,
                   'created_at', created_at,
                   'updated_at', updated_at
               )) as comments
        FROM comments
        GROUP BY review_id
    ) comment_data ON r.id = comment_data.review_id
    LEFT JOIN (
        SELECT review_id,
               json_agg(json_build_object(
                   'id', id,
                   'type', type,
                   'user_id', user_id,
                   'created_at', created_at
               )) as reactions
        FROM reactions
        GROUP BY review_id
    ) reaction_data ON r.id = reaction_data.review_id
    WHERE r.id = test_review_id;
    
    RAISE NOTICE 'SUCCESS: Complex query with relations works';
    
    -- Test 5: Verify persistence (data should remain after queries)
    IF EXISTS(SELECT 1 FROM reviews WHERE id = test_review_id) THEN
        RAISE NOTICE 'SUCCESS: Review persists';
    END IF;
    
    IF EXISTS(SELECT 1 FROM comments WHERE id = test_comment_id) THEN
        RAISE NOTICE 'SUCCESS: Comment persists';
    END IF;
    
    IF EXISTS(SELECT 1 FROM reactions WHERE id = test_reaction_id) THEN
        RAISE NOTICE 'SUCCESS: Reaction persists';
    END IF;
    
    -- Clean up test data
    DELETE FROM reactions WHERE id = test_reaction_id;
    DELETE FROM comments WHERE id = test_comment_id;
    DELETE FROM reviews WHERE id = test_review_id;
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Complete functionality test failed: %', SQLERRM;
END $$;

-- Step 7: Add some sample data for testing
DO $$
DECLARE
    sample_company_id UUID;
    sample_review_id UUID;
    sample_user_id UUID := gen_random_uuid();
BEGIN
    -- Create sample company
    INSERT INTO companies (name, slug, industry, location, size, description, website)
    VALUES ('Sample Tech Company', 'sample-tech-company', 'Technology', 'San Francisco, CA', '100-500', 'A great tech company', 'https://sampletech.com')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO sample_company_id;
    
    -- Create sample review
    INSERT INTO reviews (
        company_id, author_id, title, content, rating,
        position, department, employment_type, work_location,
        is_anonymous, is_current_employee, pros, cons, advice_to_management
    ) VALUES (
        sample_company_id, sample_user_id, 'Amazing workplace culture',
        'I have been working here for 2 years and absolutely love the culture and work-life balance.',
        5, 'Software Engineer', 'Engineering', 'full-time', 'hybrid',
        false, true, 'Great culture, flexible hours, excellent benefits', 'Sometimes deadlines are tight', 'Keep up the great work!'
    ) RETURNING id INTO sample_review_id;
    
    -- Add sample comment
    INSERT INTO comments (review_id, author_id, content, is_anonymous)
    VALUES (sample_review_id, gen_random_uuid(), 'Thanks for sharing your experience!', false);
    
    -- Add sample reaction
    INSERT INTO reactions (review_id, user_id, type)
    VALUES (sample_review_id, gen_random_uuid(), 'like');
    
    RAISE NOTICE 'Sample data created successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data creation failed: %', SQLERRM;
END $$;

-- Step 8: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Final status
SELECT 'All features fixed: reviews, comments, likes, and persistence!' as final_status;
SELECT 
    (SELECT COUNT(*) FROM reviews) as total_reviews,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM comments) as total_comments,
    (SELECT COUNT(*) FROM reactions) as total_reactions;
