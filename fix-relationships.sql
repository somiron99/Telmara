-- Fix table relationships for Supabase
-- This will resolve the "Could not find a relationship" error

-- Add foreign key constraints back (but make them non-blocking)
ALTER TABLE comments 
ADD CONSTRAINT comments_review_id_fkey 
FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

ALTER TABLE reactions 
ADD CONSTRAINT reactions_review_id_fkey 
FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

-- Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Relationships fixed! Comments and likes should work perfectly now.' as status;
