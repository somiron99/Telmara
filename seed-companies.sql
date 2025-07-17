-- Insert seed companies
INSERT INTO companies (name, slug, description, website, industry, size, location, founded) VALUES
('TechCorp Inc.', 'techcorp', 'Leading software company specializing in enterprise solutions and cloud infrastructure.', 'https://techcorp.com', 'Technology', '1000-5000', 'San Francisco, CA', '2010'),
('StartupXYZ', 'startupxyz', 'Fast-growing startup in the fintech space, revolutionizing digital payments.', 'https://startupxyz.com', 'Financial Technology', '50-200', 'New York, NY', '2018'),
('DataFlow Systems', 'dataflow', 'Big data analytics and machine learning solutions for enterprise clients.', 'https://dataflow.com', 'Data Analytics', '200-500', 'Seattle, WA', '2015'),
('CloudTech Solutions', 'cloudtech', 'Cloud infrastructure and DevOps consulting services for modern businesses.', 'https://cloudtech.com', 'Cloud Computing', '100-300', 'Austin, TX', '2019'),
('AI Innovations', 'ai-innovations', 'Artificial intelligence and machine learning research and development company.', 'https://ai-innovations.com', 'Artificial Intelligence', '50-150', 'Boston, MA', '2020'),
('CyberSecure Corp', 'cybersecure', 'Cybersecurity solutions and threat intelligence for enterprise organizations.', 'https://cybersecure.com', 'Cybersecurity', '300-800', 'Washington, DC', '2016'),
('MobileDev Studio', 'mobiledev', 'Mobile application development and user experience design agency.', 'https://mobiledev.com', 'Mobile Development', '25-75', 'Los Angeles, CA', '2017'),
('WebFlow Dynamics', 'webflow', 'Full-stack web development and e-commerce platform solutions.', 'https://webflow-dynamics.com', 'Web Development', '75-200', 'Portland, OR', '2014'),
('GameTech Interactive', 'gametech', 'Video game development and interactive entertainment software company.', 'https://gametech.com', 'Gaming', '150-400', 'San Diego, CA', '2012'),
('HealthTech Solutions', 'healthtech', 'Healthcare technology and digital health platform development.', 'https://healthtech.com', 'Healthcare Technology', '200-600', 'Chicago, IL', '2013')
ON CONFLICT (slug) DO NOTHING;
