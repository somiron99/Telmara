-- Script to remove profiles table and update references
-- Run this in your Supabase SQL Editor

-- First, drop the trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop the policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Update foreign key references to point to auth.users instead of profiles
-- Note: This will fail if there are existing records with author_id that don't exist in auth.users
-- You may need to clean up orphaned records first

-- Update reviews table
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_author_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update comments table  
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update reactions table
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_user_id_fkey;
ALTER TABLE reactions ADD CONSTRAINT reactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Finally, drop the profiles table
DROP TABLE IF EXISTS profiles CASCADE;
