export interface Event {
  id: string;
  title: string;
  date: Date;
  description: string;
  location: string;
  isMembers?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  date: Date;
  summary: string;
  content: string;
  image?: string;
  isMembers?: boolean;
}

export interface Officer {
  position: string;
  name: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface MemberProfile {
  id: string;
  user_id: string;
  full_name: string;
  position?: string;
  role: 'member' | 'admin';
  join_date: string;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'pending' | 'inactive';
  email_verified?: boolean;
  registration_date?: string;
  last_login?: string;
  notes?: string;
  // New contact and rank fields
  contact_email?: string;
  contact_phone?: string;
  masonic_provincial_rank?: string;
  grand_lodge_rank?: string;
  needs_password_reset?: boolean;
}

export interface LodgeDocument {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingMinutes {
  id: string;
  meeting_date: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  document_url?: string; // Optional URL to the full document
}

// New CMS types
export interface CMSEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  is_members_only: boolean;
  is_past_event: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  publish_date: string;
  is_members_only: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSOfficer {
  id: string;
  position: string;
  full_name: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSTestimonial {
  id: string;
  member_name: string;
  content: string;
  image_url?: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CMSFAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSSiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  description?: string;
  updated_at: string;
}

export interface CMSPageContent {
  id: string;
  page_name: string;
  section_name: string;
  content_type: 'text' | 'html' | 'json';
  content: string;
  updated_at: string;
}