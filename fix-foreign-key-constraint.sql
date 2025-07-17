-- Fix foreign key constraint issue for reactions table
-- Run this in your Supabase SQL Editor

-- Option 1: Remove the foreign key constraint (Recommended for now)
-- This allows any user_id to be inserted without requiring a profiles table

-- First, check if the constraint exists
SELECT 
    tc.constraint_name, 
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
    AND tc.table_name='reactions'
    AND kcu.column_name='user_id';

-- Drop the foreign key constraint if it exists
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='reactions'
        AND kcu.column_name='user_id'
    LIMIT 1;
    
    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE reactions DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on reactions.user_id';
    END IF;
END $$;

-- Verify the constraint is gone
SELECT 
    tc.constraint_name, 
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
    AND tc.table_name='reactions'
    AND kcu.column_name='user_id';

-- Test insert with current user
DO $$
DECLARE
    test_review_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user ID (this should be your authenticated user)
    SELECT auth.uid() INTO current_user_id;
    
    -- Get a review ID for testing
    SELECT id INTO test_review_id FROM reviews LIMIT 1;
    
    IF test_review_id IS NOT NULL AND current_user_id IS NOT NULL THEN
        -- Try to insert a test reaction
        INSERT INTO reactions (review_id, user_id, type) 
        VALUES (test_review_id, current_user_id, 'like')
        ON CONFLICT (review_id, user_id, type) DO NOTHING;
        
        RAISE NOTICE 'Test reaction insert successful for user: %', current_user_id;
        
        -- Clean up the test reaction
        DELETE FROM reactions 
        WHERE review_id = test_review_id 
        AND user_id = current_user_id 
        AND type = 'like';
        
        RAISE NOTICE 'Test reaction cleaned up';
    ELSE
        RAISE NOTICE 'Cannot test: review_id=%, user_id=%', test_review_id, current_user_id;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

SELECT 'Foreign key constraint fix completed!' as status;
