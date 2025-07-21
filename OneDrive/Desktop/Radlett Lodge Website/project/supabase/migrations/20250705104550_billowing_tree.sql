/*
  # Add Site Settings for CMS

  1. New Content
    - Add essential site settings for contact information, social media, stats, and SEO
    - These settings will replace hardcoded values throughout the site

  2. Categories
    - Contact Information (email, phone, address)
    - Social Media URLs
    - Statistics (member counts, years of service)
    - SEO Settings (meta descriptions, keywords)
    - Schema.org structured data
*/

-- Insert site settings if they don't exist
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
-- Contact Information
('lodge_name', 'Radlett Lodge No. 6652', 'text', 'Full name of the lodge'),
('lodge_number', '6652', 'text', 'Lodge number'),
('contact_email', 'mattjohnson56@hotmail.co.uk', 'email', 'Main contact email'),
('contact_phone', '07590 800657', 'text', 'Main contact phone'),
('lodge_address', 'Radlett Masonic Centre, Rose Walk, Radlett, Hertfordshire WD7 7JS', 'text', 'Full lodge address'),
('meeting_schedule_description', '1st Saturday December (Installation)\n2nd Saturday February\n1st Saturday April\n2nd Saturday July\n1st Saturday September\nAll at 4:00 PM unless otherwise stated', 'text', 'Meeting schedule description'),

-- Social Media
('facebook_url', '#', 'url', 'Facebook page URL'),
('twitter_url', '#', 'url', 'Twitter profile URL'),
('instagram_url', '#', 'url', 'Instagram profile URL'),

-- Statistics
('active_members_count', '28', 'number', 'Number of active members'),
('years_of_service', '76', 'number', 'Years since founding (since 1948)'),
('charity_raised_annually', '52M+', 'text', 'Amount raised for charity annually (UGLE)'),
('regular_meetings_count', '5', 'number', 'Number of regular meetings per year'),
('founded_year', '1948', 'number', 'Year the lodge was founded'),

-- SEO Settings
('seo_description', 'Official website of Radlett Lodge No. 6652 - Freemasons. Learn about our history, activities, and how to join.', 'text', 'Default meta description'),
('seo_keywords', 'Freemasonry, Radlett Lodge, Hertfordshire, United Grand Lodge of England, Masonic Lodge, Brotherhood, Charity', 'text', 'Default meta keywords'),
('seo_image_url', '/og-image.jpg', 'url', 'Default Open Graph image URL'),
('seo_site_url', 'https://radlettlodge6652.org.uk', 'url', 'Site canonical URL'),

-- Schema.org Data
('schema_address_street', 'Radlett Masonic Centre, Rose Walk', 'text', 'Street address for Schema.org'),
('schema_address_locality', 'Radlett', 'text', 'Locality for Schema.org'),
('schema_address_region', 'Hertfordshire', 'text', 'Region for Schema.org'),
('schema_address_postal_code', 'WD7 7JS', 'text', 'Postal code for Schema.org'),
('schema_address_country', 'GB', 'text', 'Country code for Schema.org'),
('schema_contact_telephone', '+44-7590-800657', 'text', 'Contact phone for Schema.org'),
('schema_contact_email', 'mattjohnson56@hotmail.co.uk', 'email', 'Contact email for Schema.org'),
('schema_same_as_ugle', 'https://www.ugle.org.uk/', 'url', 'UGLE website URL for Schema.org sameAs'),
('schema_same_as_pglherts', 'https://www.pglherts.org/', 'url', 'Provincial GL website URL for Schema.org sameAs')

ON CONFLICT (setting_key) DO UPDATE 
SET 
  setting_value = EXCLUDED.setting_value,
  setting_type = EXCLUDED.setting_type,
  description = EXCLUDED.description;