import { supabase } from './supabase';
import { 
  CMSEvent, 
  CMSNewsArticle, 
  CMSOfficer, 
  CMSTestimonial, 
  CMSFAQItem, 
  CMSSiteSetting, 
  CMSPageContent 
} from '../types';

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 60000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Helper to check if we should use demo mode
const shouldUseDemoMode = () => {
  return !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
};

export const cmsApi = {
  // Events
  getEvents: async (): Promise<CMSEvent[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching events:', error);
        throw new Error(`Failed to fetch events: ${error.message}`);
      }
      
      return data as CMSEvent[];
    } catch (error) {
      console.error('CMS API Error - getEvents:', error);
      throw error;
    }
  },

  getNextUpcomingEvent: async (): Promise<CMSEvent | null> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const now = new Date().toISOString();
      const query = supabase
        .from('events')
        .select('*')
        .eq('is_past_event', false)
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(1);
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching next upcoming event:', error);
        throw new Error(`Failed to fetch next upcoming event: ${error.message}`);
      }
      
      return data && data.length > 0 ? data[0] as CMSEvent : null;
    } catch (error) {
      console.error('CMS API Error - getNextUpcomingEvent:', error);
      throw error;
    }
  },

  createEvent: async (event: Omit<CMSEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CMSEvent> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('events')
        .insert(event)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error creating event:', error);
        throw new Error(`Failed to create event: ${error.message}`);
      }
      
      return data as CMSEvent;
    } catch (error) {
      console.error('CMS API Error - createEvent:', error);
      throw error;
    }
  },

  updateEvent: async (id: string, event: Partial<CMSEvent>): Promise<CMSEvent> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating event:', error);
        throw new Error(`Failed to update event: ${error.message}`);
      }
      
      return data as CMSEvent;
    } catch (error) {
      console.error('CMS API Error - updateEvent:', error);
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      const { error } = await withTimeout(query);
      
      if (error) {
        console.error('Error deleting event:', error);
        throw new Error(`Failed to delete event: ${error.message}`);
      }
    } catch (error) {
      console.error('CMS API Error - deleteEvent:', error);
      throw error;
    }
  },

  // News Articles
  getNewsArticles: async (): Promise<CMSNewsArticle[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('news_articles')
        .select('*')
        .order('publish_date', { ascending: false });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching news articles:', error);
        throw new Error(`Failed to fetch news articles: ${error.message}`);
      }
      
      return data as CMSNewsArticle[];
    } catch (error) {
      console.error('CMS API Error - getNewsArticles:', error);
      throw error;
    }
  },

  createNewsArticle: async (article: Omit<CMSNewsArticle, 'id' | 'created_at' | 'updated_at'>): Promise<CMSNewsArticle> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('news_articles')
        .insert(article)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error creating news article:', error);
        throw new Error(`Failed to create news article: ${error.message}`);
      }
      
      return data as CMSNewsArticle;
    } catch (error) {
      console.error('CMS API Error - createNewsArticle:', error);
      throw error;
    }
  },

  updateNewsArticle: async (id: string, article: Partial<CMSNewsArticle>): Promise<CMSNewsArticle> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('news_articles')
        .update(article)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating news article:', error);
        throw new Error(`Failed to update news article: ${error.message}`);
      }
      
      return data as CMSNewsArticle;
    } catch (error) {
      console.error('CMS API Error - updateNewsArticle:', error);
      throw error;
    }
  },

  deleteNewsArticle: async (id: string): Promise<void> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('news_articles')
        .delete()
        .eq('id', id);
      
      const { error } = await withTimeout(query);
      
      if (error) {
        console.error('Error deleting news article:', error);
        throw new Error(`Failed to delete news article: ${error.message}`);
      }
    } catch (error) {
      console.error('CMS API Error - deleteNewsArticle:', error);
      throw error;
    }
  },

  // Officers
  getOfficers: async (): Promise<CMSOfficer[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('officers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching officers:', error);
        throw new Error(`Failed to fetch officers: ${error.message}`);
      }
      
      return data as CMSOfficer[];
    } catch (error) {
      console.error('CMS API Error - getOfficers:', error);
      throw error;
    }
  },

  createOfficer: async (officer: Omit<CMSOfficer, 'id' | 'created_at' | 'updated_at'>): Promise<CMSOfficer> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('officers')
        .insert(officer)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error creating officer:', error);
        throw new Error(`Failed to create officer: ${error.message}`);
      }
      
      return data as CMSOfficer;
    } catch (error) {
      console.error('CMS API Error - createOfficer:', error);
      throw error;
    }
  },

  updateOfficer: async (id: string, officer: Partial<CMSOfficer>): Promise<CMSOfficer> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('officers')
        .update(officer)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating officer:', error);
        throw new Error(`Failed to update officer: ${error.message}`);
      }
      
      return data as CMSOfficer;
    } catch (error) {
      console.error('CMS API Error - updateOfficer:', error);
      throw error;
    }
  },

  deleteOfficer: async (id: string): Promise<void> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('officers')
        .delete()
        .eq('id', id);
      
      const { error } = await withTimeout(query);
      
      if (error) {
        console.error('Error deleting officer:', error);
        throw new Error(`Failed to delete officer: ${error.message}`);
      }
    } catch (error) {
      console.error('CMS API Error - deleteOfficer:', error);
      throw error;
    }
  },

  // Testimonials
  getTestimonials: async (): Promise<CMSTestimonial[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        throw new Error(`Failed to fetch testimonials: ${error.message}`);
      }
      
      return data as CMSTestimonial[];
    } catch (error) {
      console.error('CMS API Error - getTestimonials:', error);
      throw error;
    }
  },

  createTestimonial: async (testimonial: Omit<CMSTestimonial, 'id' | 'created_at' | 'updated_at'>): Promise<CMSTestimonial> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error creating testimonial:', error);
        throw new Error(`Failed to create testimonial: ${error.message}`);
      }
      
      return data as CMSTestimonial;
    } catch (error) {
      console.error('CMS API Error - createTestimonial:', error);
      throw error;
    }
  },

  updateTestimonial: async (id: string, testimonial: Partial<CMSTestimonial>): Promise<CMSTestimonial> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('testimonials')
        .update(testimonial)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating testimonial:', error);
        throw new Error(`Failed to update testimonial: ${error.message}`);
      }
      
      return data as CMSTestimonial;
    } catch (error) {
      console.error('CMS API Error - updateTestimonial:', error);
      throw error;
    }
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      const { error } = await withTimeout(query);
      
      if (error) {
        console.error('Error deleting testimonial:', error);
        throw new Error(`Failed to delete testimonial: ${error.message}`);
      }
    } catch (error) {
      console.error('CMS API Error - deleteTestimonial:', error);
      throw error;
    }
  },

  // FAQ Items
  getFAQItems: async (): Promise<CMSFAQItem[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('faq_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching FAQ items:', error);
        throw new Error(`Failed to fetch FAQ items: ${error.message}`);
      }
      
      return data as CMSFAQItem[];
    } catch (error) {
      console.error('CMS API Error - getFAQItems:', error);
      throw error;
    }
  },

  createFAQItem: async (faq: Omit<CMSFAQItem, 'id' | 'created_at' | 'updated_at'>): Promise<CMSFAQItem> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('faq_items')
        .insert(faq)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error creating FAQ item:', error);
        throw new Error(`Failed to create FAQ item: ${error.message}`);
      }
      
      return data as CMSFAQItem;
    } catch (error) {
      console.error('CMS API Error - createFAQItem:', error);
      throw error;
    }
  },

  updateFAQItem: async (id: string, faq: Partial<CMSFAQItem>): Promise<CMSFAQItem> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('faq_items')
        .update(faq)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating FAQ item:', error);
        throw new Error(`Failed to update FAQ item: ${error.message}`);
      }
      
      return data as CMSFAQItem;
    } catch (error) {
      console.error('CMS API Error - updateFAQItem:', error);
      throw error;
    }
  },

  deleteFAQItem: async (id: string): Promise<void> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('faq_items')
        .delete()
        .eq('id', id);
      
      const { error } = await withTimeout(query);
      
      if (error) {
        console.error('Error deleting FAQ item:', error);
        throw new Error(`Failed to delete FAQ item: ${error.message}`);
      }
    } catch (error) {
      console.error('CMS API Error - deleteFAQItem:', error);
      throw error;
    }
  },

  // Site Settings
  getSiteSettings: async (): Promise<CMSSiteSetting[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('site_settings')
        .select('*')
        .order('setting_key', { ascending: true });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching site settings:', error);
        throw new Error(`Failed to fetch site settings: ${error.message}`);
      }
      
      return data as CMSSiteSetting[];
    } catch (error) {
      console.error('CMS API Error - getSiteSettings:', error);
      throw error;
    }
  },

  updateSiteSetting: async (key: string, value: string): Promise<CMSSiteSetting> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('site_settings')
        .update({ setting_value: value })
        .eq('setting_key', key)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating site setting:', error);
        throw new Error(`Failed to update site setting: ${error.message}`);
      }
      
      return data as CMSSiteSetting;
    } catch (error) {
      console.error('CMS API Error - updateSiteSetting:', error);
      throw error;
    }
  },

  // Page Content
  getPageContent: async (pageName?: string): Promise<CMSPageContent[]> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      let query = supabase
        .from('page_content')
        .select('*');
      
      if (pageName) {
        query = query.eq('page_name', pageName);
      }
      
      query = query.order('page_name', { ascending: true });
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error fetching page content:', error);
        throw new Error(`Failed to fetch page content: ${error.message}`);
      }
      
      return data as CMSPageContent[];
    } catch (error) {
      console.error('CMS API Error - getPageContent:', error);
      throw error;
    }
  },

  updatePageContent: async (pageName: string, sectionName: string, content: string): Promise<CMSPageContent> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('page_content')
        .upsert({ 
          page_name: pageName, 
          section_name: sectionName, 
          content: content,
          content_type: 'text'
        })
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error updating page content:', error);
        throw new Error(`Failed to update page content: ${error.message}`);
      }
      
      return data as CMSPageContent;
    } catch (error) {
      console.error('CMS API Error - updatePageContent:', error);
      throw error;
    }
  },

  createPageContent: async (pageContent: Omit<CMSPageContent, 'id' | 'updated_at'>): Promise<CMSPageContent> => {
    try {
      if (shouldUseDemoMode()) {
        throw new Error('Demo mode - no database connection');
      }
      
      const query = supabase
        .from('page_content')
        .insert(pageContent)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query);
      
      if (error) {
        console.error('Error creating page content:', error);
        throw new Error(`Failed to create page content: ${error.message}`);
      }
      
      return data as CMSPageContent;
    } catch (error) {
      console.error('CMS API Error - createPageContent:', error);
      throw error;
    }
  }
};