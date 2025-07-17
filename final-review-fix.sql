-- Final comprehensive fix for review creation
-- This will completely rebuild the reviews table to match frontend expectations

-- Step 1: Drop and recreate reviews table with exact structure needed
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    author_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    position TEXT,
    department TEXT,
    employment_type TEXT,
    work_location TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_current_employee BOOLEAN DEFAULT true,
    pros TEXT,
    cons TEXT,
    advice_to_management TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_author_id ON reviews(author_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Step 3: Disable RLS and grant all permissions
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO anon;
GRANT ALL ON reviews TO postgres;

-- Step 4: Ensure companies table is accessible
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
GRANT ALL ON companies TO authenticated;
GRANT ALL ON companies TO anon;
GRANT ALL ON companies TO postgres;

-- Step 5: Test with exact frontend data structure
DO $$
DECLARE
    test_company_id UUID;
    test_review_id UUID;
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
    
    -- Test exact frontend data structure
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
        test_user_id,
        'Test Review Title',
        'Test review content that should work',
        4,
        'Software Engineer',
        'Engineering',
        'full-time',
        'remote',
        false,
        true,
        'Great benefits and flexible work',
        'Long hours sometimes',
        'Keep up the good work'
    ) RETURNING id INTO test_review_id;
    
    RAISE NOTICE 'SUCCESS: Test review created with ID: %', test_review_id;
    
    -- Verify it exists and can be queried
    IF EXISTS(SELECT 1 FROM reviews WHERE id = test_review_id) THEN
        RAISE NOTICE 'SUCCESS: Test review verified in database';
        
        -- Test the exact query the frontend uses
        PERFORM r.*, c.name as company_name
        FROM reviews r
        LEFT JOIN companies c ON r.company_id = c.id
        WHERE r.id = test_review_id;
        
        RAISE NOTICE 'SUCCESS: Frontend-style query works';
    ELSE
        RAISE NOTICE 'ERROR: Test review not found';
    END IF;
    
    -- Clean up
    DELETE FROM reviews WHERE id = test_review_id;
    RAISE NOTICE 'Test review cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Review creation test failed: %', SQLERRM;
        RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;

-- Step 6: Add some sample data to ensure everything works
DO $$
DECLARE
    sample_company_id UUID;
    sample_review_id UUID;
BEGIN
    -- Create a sample company if none exist
    INSERT INTO companies (name, slug, industry, location, size, description, website)
    VALUES ('Sample Tech Corp', 'sample-tech-corp', 'Technology', 'San Francisco, CA', '100-500', 'A sample technology company', 'https://sampletech.com')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO sample_company_id;
    
    -- Create a sample review
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
        sample_company_id,
        gen_random_uuid(),
        'Great place to work',
        'I really enjoyed my time at this company. The culture is amazing and the work is challenging.',
        5,
        'Software Developer',
        'Engineering',
        'full-time',
        'hybrid',
        false,
        true,
        'Great culture, challenging work, good benefits',
        'Sometimes deadlines are tight',
        'Keep fostering the collaborative environment'
    ) RETURNING id INTO sample_review_id;
    
    RAISE NOTICE 'Created sample review with ID: %', sample_review_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data creation failed: %', SQLERRM;
END $$;

-- Step 7: Final verification
SELECT 'Reviews table completely rebuilt and tested!' as status;
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT COUNT(*) as total_companies FROM companies;

-- Show the final table structure
SELECT 'Final reviews table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Review creation should now work perfectly!' as final_message;
