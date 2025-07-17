-- Add Stein and Graham Plc to companies table
INSERT INTO companies (name, slug, description, website, industry, size, location, founded) 
VALUES (
  'Stein and Graham Plc',
  'stein-and-graham-plc',
  'Professional services company specializing in consulting and advisory services',
  'https://steinandgraham.com',
  'Professional Services',
  '100-500',
  'London, UK',
  '2010'
) ON CONFLICT (slug) DO NOTHING;

-- Verify the company was added
SELECT * FROM companies WHERE name = 'Stein and Graham Plc';
