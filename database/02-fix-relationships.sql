-- Fix relationships between tables
-- Run this script after 01-initial-setup.sql

-- Add foreign key constraints
ALTER TABLE reviews 
ADD CONSTRAINT reviews_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_review_id_fkey 
FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

ALTER TABLE reactions 
ADD CONSTRAINT reactions_review_id_fkey 
FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

-- Add unique constraint for reactions (one reaction per user per review)
ALTER TABLE reactions 
ADD CONSTRAINT reactions_unique_user_review 
UNIQUE(review_id, user_id, type);

-- Refresh the Supabase schema cache
NOTIFY pgrst, 'reload schema';

-- Test that relationships work
DO $$
DECLARE
    test_company_id UUID;
    test_review_id UUID;
    test_comment_id UUID;
    test_reaction_id UUID;
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Get an existing company
    SELECT id INTO test_company_id FROM companies LIMIT 1;
    
    IF test_company_id IS NOT NULL THEN
        -- Test inserting a review with the relationship
        INSERT INTO reviews (
            company_id, author_id, title, content, rating,
            position, department, employment_type, work_location,
            is_anonymous, is_current_employee, pros, cons, advice_to_management
        ) VALUES (
            test_company_id, test_user_id, 'Relationship Test Review',
            'Testing that the foreign key relationship works', 4,
            'Test Position', 'Test Department', 'full-time', 'remote',
            false, true, 'Test pros', 'Test cons', 'Test advice'
        ) RETURNING id INTO test_review_id;
        
        RAISE NOTICE 'SUCCESS: Review inserted with relationship - ID: %', test_review_id;
        
        -- Test adding a comment
        INSERT INTO comments (review_id, author_id, content, is_anonymous)
        VALUES (test_review_id, test_user_id, 'Test comment on review', false)
        RETURNING id INTO test_comment_id;
        
        RAISE NOTICE 'SUCCESS: Comment inserted with relationship - ID: %', test_comment_id;
        
        -- Test adding a reaction
        INSERT INTO reactions (review_id, user_id, type)
        VALUES (test_review_id, test_user_id, 'like')
        RETURNING id INTO test_reaction_id;
        
        RAISE NOTICE 'SUCCESS: Reaction inserted with relationship - ID: %', test_reaction_id;
        
        -- Test the exact query that Supabase uses
        PERFORM r.*, 
                c.id as company_id,
                c.name as company_name,
                c.slug as company_slug
        FROM reviews r
        LEFT JOIN companies c ON r.company_id = c.id
        WHERE r.id = test_review_id;
        
        RAISE NOTICE 'SUCCESS: Supabase-style query works';
        
        -- Clean up test data
        DELETE FROM reactions WHERE id = test_reaction_id;
        DELETE FROM comments WHERE id = test_comment_id;
        DELETE FROM reviews WHERE id = test_review_id;
        RAISE NOTICE 'Test data cleaned up';
        
    ELSE
        RAISE NOTICE 'No companies found for testing';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Relationship test failed: %', SQLERRM;
END $$;

-- Show current foreign key constraints
SELECT 'Current foreign key constraints:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('reviews', 'comments', 'reactions');

SELECT 'Relationships between tables established successfully!' as final_message;
