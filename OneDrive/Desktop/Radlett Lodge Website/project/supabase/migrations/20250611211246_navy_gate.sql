/*
  # Complete CMS System for Radlett Lodge

  1. New Tables
    - `events` - All lodge events (upcoming and past)
    - `news_articles` - News and announcements
    - `officers` - Lodge officers and their positions
    - `testimonials` - Member testimonials
    - `faq_items` - Frequently asked questions
    - `site_settings` - General site configuration
    - `page_content` - Editable page sections

  2. Security
    - Enable RLS on all tables
    - Members can view all content
    - Only admins can manage content

  3. Sample Data
    - Populate tables with existing content from data files
*/

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    is_members_only BOOLEAN DEFAULT false,
    is_past_event BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    publish_date DATE NOT NULL,
    is_members_only BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create officers table
CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position TEXT NOT NULL,
    full_name TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_name TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faq_items table
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'text', -- text, number, boolean, json
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create page_content table
CREATE TABLE IF NOT EXISTS public.page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- text, html, json
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_name, section_name)
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (members can view, admins can manage)
-- Events policies
CREATE POLICY "Members can view all events"
    ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage events"
    ON public.events FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- News articles policies
CREATE POLICY "Members can view published news"
    ON public.news_articles FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins can manage news"
    ON public.news_articles FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- Officers policies
CREATE POLICY "Members can view active officers"
    ON public.officers FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage officers"
    ON public.officers FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- Testimonials policies
CREATE POLICY "Members can view published testimonials"
    ON public.testimonials FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- FAQ policies
CREATE POLICY "Members can view published FAQs"
    ON public.faq_items FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins can manage FAQs"
    ON public.faq_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- Site settings policies
CREATE POLICY "Members can view site settings"
    ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage site settings"
    ON public.site_settings FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- Page content policies
CREATE POLICY "Members can view page content"
    ON public.page_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage page content"
    ON public.page_content FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = auth.uid() AND mp.role = 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON public.news_articles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_officers_updated_at
    BEFORE UPDATE ON public.officers FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at
    BEFORE UPDATE ON public.faq_items FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
    BEFORE UPDATE ON public.page_content FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_past ON public.events(is_past_event);
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON public.news_articles(publish_date);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_officers_sort_order ON public.officers(sort_order);
CREATE INDEX IF NOT EXISTS idx_officers_active ON public.officers(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order ON public.testimonials(sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_faq_sort_order ON public.faq_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_faq_published ON public.faq_items(is_published);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_page_content_page_section ON public.page_content(page_name, section_name);

-- Insert sample events data
INSERT INTO public.events (title, description, event_date, location, is_members_only, is_past_event) VALUES
('Regular Lodge Meeting', 'The April regular meeting of Radlett Lodge No. 6652. Dinner to follow at the Masonic Center.', '2025-04-15 19:00:00+00', 'Radlett Masonic Centre, Watling Street', true, false),
('Annual Installation Ceremony', 'Installation of the new Worshipful Master and appointment of officers for the coming year.', '2025-05-20 18:00:00+00', 'Radlett Masonic Centre, Watling Street', true, false),
('Charity Fundraising Dinner', 'Annual charity dinner raising funds for local causes. Open to members, friends, and family.', '2025-06-12 19:30:00+00', 'The Red Lion Hotel, Radlett', false, false),
('Open Day - Learn About Freemasonry', 'A public open day where visitors can learn about Freemasonry, its history, and principles. Tours of the Lodge room will be available.', '2025-07-05 13:00:00+00', 'Radlett Masonic Centre, Watling Street', false, false),
('Christmas Festive Board', 'Annual Christmas celebration with members and their families.', '2024-12-18 19:00:00+00', 'Radlett Masonic Centre, Watling Street', true, true),
('Provincial Grand Lodge Meeting', 'Annual meeting of the Provincial Grand Lodge of Hertfordshire.', '2024-11-10 14:00:00+00', 'Provincial Headquarters, Hatfield', true, true)
ON CONFLICT DO NOTHING;

-- Insert sample news articles
INSERT INTO public.news_articles (title, summary, content, image_url, publish_date, is_members_only) VALUES
('New Worshipful Master Installed', 'Radlett Lodge No. 6652 celebrated the installation of its new Worshipful Master in a beautiful ceremony.', '<p>In a ceremony steeped in tradition and witnessed by distinguished guests and members, Radlett Lodge No. 6652 installed its new Worshipful Master for the coming year.</p><p>The Installation meeting, which was attended by representatives from the Provincial Grand Lodge of Hertfordshire, marked the beginning of a new chapter for the Lodge under the guidance of its newly appointed leader.</p><p>Following the ceremony, members and guests enjoyed a festive board where toasts were raised to the continued success of the Lodge and its charitable endeavors.</p>', 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '2024-12-15', false),
('Charitable Donation to Local School', 'Members of Radlett Lodge presented a cheque for £5,000 to support the special needs department at a local school.', '<p>Radlett Lodge No. 6652 continues its commitment to supporting the local community with a substantial donation to enhance educational resources for children with special needs.</p><p>The £5,000 donation will fund new sensory equipment and learning aids, making a significant difference to the educational experience of many young people in our community.</p><p>The headteacher expressed heartfelt gratitude, stating that the donation would have a transformative impact on their special needs provision.</p>', 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '2024-11-22', false),
('Lodge Summer Barbecue Success', 'Members and their families enjoyed a wonderful summer afternoon at our annual barbecue.', '<p>The annual summer barbecue for Radlett Lodge No. 6652 members and their families was a tremendous success, with over 60 people in attendance.</p><p>Held in the beautiful gardens of Brother James Smith, the event featured delicious food, games for children, and an opportunity for the extended Masonic family to come together in a relaxed setting.</p><p>The day raised £750 for our ongoing charitable projects, adding to the enjoyment of a perfect summer''s day.</p>', 'https://images.pexels.com/photos/5638612/pexels-photo-5638612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '2024-08-15', false)
ON CONFLICT DO NOTHING;

-- Insert sample officers
INSERT INTO public.officers (position, full_name, image_url, sort_order) VALUES
('Worshipful Master', 'James Wilson', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 1),
('Senior Warden', 'Thomas Bennett', 'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 2),
('Junior Warden', 'Robert Harris', 'https://images.pexels.com/photos/2182972/pexels-photo-2182972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 3),
('Treasurer', 'David Thompson', 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 4),
('Secretary', 'Michael Clark', 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 5),
('Charity Steward', 'Paul Edwards', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 6)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO public.testimonials (member_name, content, image_url, sort_order) VALUES
('Andrew Parker', 'Joining Radlett Lodge has been one of the most rewarding decisions of my life. The brotherhood, the charitable work, and the personal development have all enriched my life in ways I never expected.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 1),
('Richard Foster', 'As someone who was looking for a way to give back to my community while forming meaningful friendships, Radlett Lodge has provided the perfect platform. The traditions and values of Freemasonry resonate deeply with me.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 2),
('Daniel Matthews', 'After 15 years as a member of Radlett Lodge, I continue to learn and grow. The supportive environment and timeless principles have helped me become a better man, husband, father, and community member.', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 3)
ON CONFLICT DO NOTHING;

-- Insert sample FAQ items
INSERT INTO public.faq_items (question, answer, sort_order) VALUES
('What is Freemasonry?', 'Freemasonry is one of the world''s oldest secular fraternal societies. It teaches moral lessons and self-knowledge through participation in a progression of allegorical plays. It is a society of men concerned with moral and spiritual values, and its members are taught its principles by a series of ritual dramas.', 1),
('How do I join Radlett Lodge No. 6652?', 'To join Radlett Lodge, you need to be at least 21 years old, believe in a Supreme Being, and be of good character. The process begins with getting to know current members, followed by a formal application. We encourage potential candidates to attend some of our social events to meet our members before applying.', 2),
('How often does Radlett Lodge meet?', 'Radlett Lodge No. 6652 typically meets four times a year for formal Lodge meetings, usually in February, April, October, and December. We also hold regular social events and gatherings throughout the year that are open to members, their families, and sometimes the public.', 3),
('What charitable work does the Lodge do?', 'Radlett Lodge is actively involved in charitable activities within our local community and beyond. We regularly raise funds for local charities, schools, and healthcare initiatives. Additionally, we support the wider charitable efforts of the United Grand Lodge of England and the Provincial Grand Lodge of Hertfordshire.', 4),
('Is Freemasonry a religion?', 'No, Freemasonry is not a religion. It has no theological doctrine, and it is not a substitute for religion. It expects its members to follow their own faith, and its ceremonies include prayers, but these are non-denominational and acceptable to all religions.', 5),
('What happens in a Freemasons meeting?', 'Lodge meetings typically consist of administrative business, discussions about charitable projects, ceremonies to welcome new members or to mark a member''s progression, and sometimes lectures on Masonic history or symbolism. After formal meetings, members usually enjoy a meal together known as the Festive Board.', 6)
ON CONFLICT DO NOTHING;

-- Insert sample site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
('lodge_name', 'Radlett Lodge No. 6652', 'text', 'Full name of the lodge'),
('lodge_number', '6652', 'text', 'Lodge number'),
('contact_email', 'secretary@radlettlodge6652.org.uk', 'text', 'Main contact email'),
('contact_phone', '+44 123 456 7890', 'text', 'Main contact phone'),
('meeting_location', 'Radlett Masonic Centre, Watling Street, Radlett, Hertfordshire', 'text', 'Primary meeting location'),
('meeting_schedule', 'Third Tuesday of February, April, October, and December at 6:00pm', 'text', 'Regular meeting schedule'),
('founded_year', '1948', 'text', 'Year the lodge was founded'),
('facebook_url', '#', 'text', 'Facebook page URL'),
('twitter_url', '#', 'text', 'Twitter profile URL'),
('instagram_url', '#', 'text', 'Instagram profile URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample page content
INSERT INTO public.page_content (page_name, section_name, content_type, content) VALUES
('homepage', 'hero_title', 'text', 'Lodge No. 6652'),
('homepage', 'hero_subtitle', 'text', 'Brotherhood, Charity, and Moral Teachings - A Masonic Lodge Under the United Grand Lodge of England'),
('homepage', 'welcome_title', 'text', 'Welcome to Our Lodge'),
('homepage', 'welcome_text', 'html', '<p>Founded in 1948, Lodge No. 6652 is a vibrant Masonic Lodge operating under the United Grand Lodge of England within the Province of Hertfordshire.</p><p>Our Lodge is committed to fostering personal development, ethical conduct, and charitable endeavors among our members while maintaining the rich traditions of Freemasonry.</p>'),
('about', 'history_title', 'text', 'Our History'),
('about', 'history_subtitle', 'text', 'Founded in 1948, Radlett Lodge No. 6652 has a rich heritage spanning over 75 years.'),
('about', 'history_content', 'html', '<p>Radlett Lodge was consecrated on March 15, 1948, in the aftermath of World War II, as part of the significant expansion of Freemasonry that took place during that period. The Lodge was named after the village of Radlett in Hertfordshire, where many of the founding members resided.</p><p>Over the decades, our Lodge has flourished, maintaining the timeless traditions of Freemasonry while adapting to the changing times. We have been privileged to count among our members individuals from diverse backgrounds and professions, all united by their commitment to our core principles.</p><p>Throughout our history, Radlett Lodge has maintained strong connections with the local community through charitable work and public engagement, continuing the long tradition of Masonic service to society.</p>')
ON CONFLICT (page_name, section_name) DO NOTHING;