-- Fix the relationship error between reviews and companies
-- This will establish the proper foreign key relationship

-- Step 1: Add the foreign key relationship back
ALTER TABLE reviews 
ADD CONSTRAINT reviews_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Step 2: Refresh the Supabase schema cache
NOTIFY pgrst, 'reload schema';

-- Step 3: Test that the relationship works
DO $$
DECLARE
    test_company_id UUID;
    test_review_id UUID;
BEGIN
    -- Get an existing company
    SELECT id INTO test_company_id FROM companies LIMIT 1;
    
    IF test_company_id IS NOT NULL THEN
        -- Test that we can query reviews with companies using the relationship
        PERFORM r.*, c.name as company_name
        FROM reviews r
        LEFT JOIN companies c ON r.company_id = c.id
        WHERE r.company_id = test_company_id
        LIMIT 1;
        
        RAISE NOTICE 'SUCCESS: Reviews-Companies relationship works';
        
        -- Test inserting a review with the relationship
        INSERT INTO reviews (
            company_id,
            author_id,
            title,
            content,
            rating,
            position,
            department,
            employment_type,
            work_location,
            is_anonymous,
            is_current_employee,
            pros,
            cons,
            advice_to_management
        ) VALUES (
            test_company_id,
            gen_random_uuid(),
            'Relationship Test Review',
            'Testing that the foreign key relationship works',
            4,
            'Test Position',
            'Test Department',
            'full-time',
            'remote',
            false,
            true,
            'Test pros',
            'Test cons',
            'Test advice'
        ) RETURNING id INTO test_review_id;
        
        RAISE NOTICE 'SUCCESS: Review inserted with relationship - ID: %', test_review_id;
        
        -- Test the exact query that Supabase uses
        PERFORM r.*, 
                c.id as company_id,
                c.name as company_name,
                c.slug as company_slug,
                c.logo_url as company_logo_url,
                c.industry as company_industry,
                c.location as company_location,
                c.size as company_size,
                c.description as company_description,
                c.website as company_website,
                c.created_at as company_created_at,
                c.updated_at as company_updated_at
        FROM reviews r
        LEFT JOIN companies c ON r.company_id = c.id
        WHERE r.id = test_review_id;
        
        RAISE NOTICE 'SUCCESS: Supabase-style query works';
        
        -- Clean up test review
        DELETE FROM reviews WHERE id = test_review_id;
        RAISE NOTICE 'Test review cleaned up';
        
    ELSE
        RAISE NOTICE 'No companies found for testing';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Relationship test failed: %', SQLERRM;
END $$;

-- Step 4: Show current table relationships
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
AND tc.table_name IN ('reviews', 'companies', 'comments', 'reactions');

SELECT 'Relationship between reviews and companies should now work!' as final_message;
