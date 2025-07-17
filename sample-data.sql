-- Sample data for testing the workplace reviews application
-- Run this after setting up the main schema

-- Insert sample companies
INSERT INTO companies (name, slug, description, website, industry, size, location) VALUES
('TechCorp Inc.', 'techcorp-inc', 'Leading software development company specializing in web applications', 'https://techcorp.com', 'Software Development', '100-500', 'San Francisco, CA'),
('DataSoft Solutions', 'datasoft-solutions', 'Data analytics and machine learning solutions provider', 'https://datasoft.com', 'Data Analytics', '50-100', 'New York, NY'),
('CloudTech Systems', 'cloudtech-systems', 'Cloud infrastructure and DevOps services', 'https://cloudtech.com', 'Cloud Computing', '200-1000', 'Seattle, WA'),
('AI Innovations Lab', 'ai-innovations-lab', 'Artificial intelligence research and development', 'https://ailab.com', 'Artificial Intelligence', '20-50', 'Austin, TX'),
('WebFlow Digital', 'webflow-digital', 'Digital marketing and web development agency', 'https://webflow.com', 'Digital Marketing', '10-50', 'Remote');

-- Insert sample reviews (these will work once you have the companies)
-- Note: You'll need to replace the company_id values with actual UUIDs from your companies table
-- You can get these by running: SELECT id, name FROM companies;

-- Example review insert (replace the UUID with actual company ID)
-- INSERT INTO reviews (company_id, title, content, rating, position, department, employment_type, work_location, is_anonymous, is_current_employee, pros, cons, advice_to_management) VALUES
-- ('your-company-uuid-here', 'Great place to work with amazing culture', 'I have been working here for 2 years and it has been an incredible journey. The team is supportive, management is understanding, and there are great opportunities for growth.', 5, 'Senior Software Engineer', 'Engineering', 'Full-time', 'Remote', true, true, 'Great work-life balance, competitive salary, excellent benefits', 'Sometimes the workload can be intense during product launches', 'Keep up the great work! Maybe consider more team building activities.');

-- To add reviews with actual data, first get company IDs:
-- SELECT id, name FROM companies ORDER BY name;
-- Then use those IDs in the INSERT statements above
