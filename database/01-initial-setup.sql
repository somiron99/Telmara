-- Initial Database Setup for Workplace Reviews Platform
-- Run this script first in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    industry TEXT,
    location TEXT,
    size TEXT,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
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

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL,
    author_id UUID,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);

CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author_id ON reviews(author_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_reactions_review_id ON reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- Disable RLS for development (enable for production)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON companies TO authenticated, anon, postgres;
GRANT ALL ON reviews TO authenticated, anon, postgres;
GRANT ALL ON comments TO authenticated, anon, postgres;
GRANT ALL ON reactions TO authenticated, anon, postgres;

-- Add some sample companies
INSERT INTO companies (name, slug, industry, location, size, description, website) VALUES
('TechCorp Solutions', 'techcorp-solutions', 'Technology', 'San Francisco, CA', '100-500', 'Leading software development company', 'https://techcorp.com'),
('DataFlow Inc', 'dataflow-inc', 'Technology', 'New York, NY', '50-100', 'Data analytics and AI solutions', 'https://dataflow.com'),
('CloudWorks', 'cloudworks', 'Technology', 'Seattle, WA', '500-1000', 'Cloud infrastructure services', 'https://cloudworks.com'),
('StartupHub', 'startuphub', 'Technology', 'Austin, TX', '10-50', 'Early-stage startup incubator', 'https://startuphub.com'),
('Enterprise Systems', 'enterprise-systems', 'Technology', 'Boston, MA', '1000+', 'Enterprise software solutions', 'https://enterprisesys.com')
ON CONFLICT (slug) DO NOTHING;

-- Success message
SELECT 'Initial database setup completed successfully!' as status;
SELECT 
    (SELECT COUNT(*) FROM companies) as companies_created,
    'Tables created: companies, reviews, comments, reactions' as tables_info;
