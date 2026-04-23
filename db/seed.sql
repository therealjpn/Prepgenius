INSERT INTO subjects (exam_type, name, slug, icon, topics) VALUES
('jamb', 'Mathematics', 'mathematics', 'Calculator', '["Algebra","Quadratic Equations","Indices","Logarithms","Statistics"]'::jsonb),
('jamb', 'English', 'english', 'BookOpen', '["Lexis","Comprehension","Summary","Sentence Interpretation"]'::jsonb),
('jamb', 'Physics', 'physics', 'Atom', '["Mechanics","Waves","Electricity","Heat"]'::jsonb),
('jamb', 'Chemistry', 'chemistry', 'FlaskConical', '["Atomic Structure","Stoichiometry","Organic Chemistry","Electrolysis"]'::jsonb),
('waec', 'Biology', 'biology', 'Microscope', '["Cell Biology","Ecology","Genetics","Evolution"]'::jsonb),
('neco', 'Government', 'government', 'Landmark', '["Constitution","Democracy","Citizenship","Public Administration"]'::jsonb),
('ican', 'Financial Reporting', 'financial-reporting', 'BadgePercent', '["IFRS Framework","IAS 1","IAS 16","IAS 36","Cash Flow Statements"]'::jsonb);

