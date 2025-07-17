# Database Setup Guide

This directory contains all the SQL scripts needed to set up your Supabase database for the Workplace Reviews Platform.

## 📋 Setup Order

Run these scripts in the following order in your Supabase SQL Editor:

### 1. Initial Setup
**File**: `01-initial-setup.sql`
- Creates the basic database schema
- Sets up tables for companies, reviews, comments, reactions
- Establishes initial relationships
- Configures basic permissions

### 2. Fix Relationships
**File**: `02-fix-relationships.sql`
- Adds proper foreign key constraints
- Fixes relationship issues between tables
- Refreshes Supabase schema cache
- Tests relationship functionality

### 3. Complete Feature Fix
**File**: `03-complete-fix.sql`
- Rebuilds tables with proper structure
- Ensures all features work (reviews, likes, comments)
- Adds sample data for testing
- Final verification of all functionality

## 🗄️ Database Schema

### Tables Overview

#### `companies`
Stores company information and metadata.
```sql
- id (UUID, Primary Key)
- name (TEXT, NOT NULL)
- slug (TEXT, UNIQUE)
- industry (TEXT)
- location (TEXT)
- size (TEXT)
- description (TEXT)
- website (TEXT)
- logo_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `reviews`
Stores user reviews with ratings and detailed feedback.
```sql
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key → companies.id)
- author_id (UUID, nullable for anonymous reviews)
- title (TEXT, NOT NULL)
- content (TEXT, NOT NULL)
- rating (INTEGER, 1-5)
- position (TEXT)
- department (TEXT)
- employment_type (TEXT)
- work_location (TEXT)
- is_anonymous (BOOLEAN)
- is_current_employee (BOOLEAN)
- pros (TEXT)
- cons (TEXT)
- advice_to_management (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `comments`
Stores comments on reviews.
```sql
- id (UUID, Primary Key)
- review_id (UUID, Foreign Key → reviews.id)
- author_id (UUID, nullable for anonymous comments)
- content (TEXT, NOT NULL)
- is_anonymous (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `reactions`
Stores likes and other reactions on reviews.
```sql
- id (UUID, Primary Key)
- review_id (UUID, Foreign Key → reviews.id)
- user_id (UUID, NOT NULL)
- type (VARCHAR, default 'like')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(review_id, user_id, type)
```

### Indexes
Performance indexes are created for:
- `reviews.company_id`
- `reviews.created_at`
- `reviews.rating`
- `comments.review_id`
- `reactions.review_id`
- `reactions.user_id`

### Security
- Row Level Security (RLS) is disabled for development
- All tables grant permissions to `authenticated`, `anon`, and `postgres` roles
- Foreign key constraints ensure data integrity

## 🚀 Quick Setup

### Option 1: Run All Scripts
Copy and paste each script in order into your Supabase SQL Editor.

### Option 2: Combined Script
If you prefer, you can run all scripts in sequence:

```sql
-- Run 01-initial-setup.sql first
-- Then run 02-fix-relationships.sql
-- Finally run 03-complete-fix.sql
```

## ✅ Verification

After running all scripts, you should see:
- All tables created successfully
- Foreign key relationships established
- Sample data populated
- Success messages in the SQL output

### Test Queries
Run these queries to verify everything works:

```sql
-- Check table structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'reviews', 'comments', 'reactions');

-- Check sample data
SELECT COUNT(*) as total_companies FROM companies;
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT COUNT(*) as total_comments FROM comments;
SELECT COUNT(*) as total_reactions FROM reactions;

-- Test relationships
SELECT r.title, c.name as company_name 
FROM reviews r 
LEFT JOIN companies c ON r.company_id = c.id 
LIMIT 5;
```

## 🔧 Troubleshooting

### Common Issues

#### "Table already exists" error
- Drop existing tables first or use `DROP TABLE IF EXISTS`
- Or modify scripts to use `CREATE TABLE IF NOT EXISTS`

#### "Permission denied" error
- Ensure you're running scripts as the database owner
- Check that RLS policies are properly configured

#### "Foreign key constraint" error
- Ensure parent tables exist before creating child tables
- Check that referenced columns have the correct data types

#### "Schema cache" issues
- Run `NOTIFY pgrst, 'reload schema';` to refresh
- Restart your Supabase project if needed

### Getting Help
If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your database permissions
3. Ensure scripts are run in the correct order
4. Create an issue in the GitHub repository

## 📝 Customization

### Adding New Tables
1. Create the table structure
2. Add appropriate indexes
3. Set up foreign key relationships
4. Configure permissions
5. Add sample data if needed

### Modifying Existing Tables
1. Use `ALTER TABLE` statements
2. Update related indexes
3. Refresh schema cache
4. Test all functionality

### Sample Data
The scripts include sample data for testing. You can:
- Modify the sample data in the scripts
- Add more sample companies and reviews
- Remove sample data for production

## 🔒 Production Considerations

### Security
- Enable Row Level Security (RLS) for production
- Create proper security policies
- Limit permissions to necessary roles only
- Use environment-specific configurations

### Performance
- Monitor query performance
- Add additional indexes as needed
- Consider partitioning for large datasets
- Implement proper caching strategies

### Backup
- Set up automated backups
- Test restore procedures
- Document backup/restore processes
- Monitor backup success

---

**Need help?** Check the main README.md or create an issue on GitHub.
