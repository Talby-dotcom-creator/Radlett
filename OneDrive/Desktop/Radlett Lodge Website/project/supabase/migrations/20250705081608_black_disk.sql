/*
  # Add Solomon Document Category

  1. New Data
    - Add a new document record for Solomon UGLE resource
    - Category: 'solomon'
    - URL: https://solomon.ugle.org.uk/

  2. Purpose
    - Provide access to the official UGLE learning and development resource
*/

-- Insert the Solomon document
INSERT INTO public.lodge_documents (title, description, url, category) VALUES
('Solomon', 'Official learning and development resource from the United Grand Lodge of England', 'https://solomon.ugle.org.uk/', 'solomon')
ON CONFLICT DO NOTHING;