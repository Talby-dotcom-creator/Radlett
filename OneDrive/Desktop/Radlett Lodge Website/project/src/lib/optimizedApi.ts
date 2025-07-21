import { supabase } from './supabase';
import { dataCache, deduplicateRequest, CACHE_KEYS } from './dataCache';
import { MemberProfile, LodgeDocument, MeetingMinutes, CMSEvent, CMSNewsArticle, CMSOfficer, CMSTestimonial, CMSFAQItem, CMSSiteSetting, CMSPageContent } from '../types';

// Demo data for when database is not connected
const demoDocuments: LodgeDocument[] = [
  {
    id: '1',
    title: 'Grand Lodge Quarterly Communication - Q4 2024',
    description: 'Latest quarterly communication from the United Grand Lodge of England',
    url: 'https://example.com/grand-lodge-quarterly-q4-2024.pdf',
    category: 'grand_lodge',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Grand Lodge Annual Report 2024',
    description: 'Annual report from the United Grand Lodge of England',
    url: 'https://example.com/grand-lodge-annual-2024.pdf',
    category: 'grand_lodge',
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-11-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Provincial Grand Lodge Newsletter - Winter 2024',
    description: 'Hertfordshire Provincial Grand Lodge quarterly newsletter',
    url: 'https://example.com/provincial-newsletter-winter-2024.pdf',
    category: 'provincial',
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z'
  },
  {
    id: '4',
    title: 'Summons - December 2024 Regular Meeting',
    description: 'Official summons for the December regular meeting',
    url: 'https://example.com/summons-december-2024.pdf',
    category: 'summons',
    created_at: '2024-11-25T00:00:00Z',
    updated_at: '2024-11-25T00:00:00Z'
  },
  {
    id: '5',
    title: 'Lodge of Instruction - Week 48 Minutes',
    description: 'Minutes from Lodge of Instruction meeting - Week 48, 2024',
    url: 'https://example.com/loi-week-48-2024.pdf',
    category: 'lodge_instruction',
    created_at: '2024-11-28T00:00:00Z',
    updated_at: '2024-11-28T00:00:00Z'
  },
  {
    id: '6',
    title: 'Lodge Bylaws 2024',
    description: 'Updated lodge bylaws and regulations',
    url: 'https://example.com/bylaws-2024.pdf',
    category: 'resources',
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z'
  },
  {
    id: '7',
    title: 'Ritual Guide - Entered Apprentice',
    description: 'Guide for the Entered Apprentice degree ceremony',
    url: 'https://example.com/ea-ritual.pdf',
    category: 'ritual',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z'
  },
  {
    id: '8',
    title: 'Membership Application Form',
    description: 'Form for new membership applications',
    url: 'https://example.com/membership-form.pdf',
    category: 'forms',
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-07-15T00:00:00Z'
  },
  {
    id: '9',
    title: 'Solomon Learning Resources',
    description: 'Access to UGLE Solomon learning platform resources',
    url: 'https://example.com/solomon-resources.pdf',
    category: 'solomon',
    created_at: '2024-09-10T00:00:00Z',
    updated_at: '2024-09-10T00:00:00Z'
  },
  {
    id: '10',
    title: 'Charity Application Form',
    description: 'Form for submitting charity funding requests',
    url: 'https://example.com/charity-form.pdf',
    category: 'other',
    created_at: '2024-09-15T00:00:00Z',
    updated_at: '2024-09-15T00:00:00Z'
  }
];

const demoMinutes: MeetingMinutes[] = [
  {
    id: '1',
    meeting_date: '2024-12-10',
    title: 'December Regular Meeting',
    content: 'The Lodge was opened in due form by the Worshipful Master. Present were 24 members and 3 visitors. The minutes of the previous meeting were read and approved. The Treasurer reported a healthy balance. Three candidates were proposed for initiation. The charity steward announced successful fundraising efforts totaling £2,500 for local charities. The Lodge was closed in harmony at 9:30 PM.',
    created_at: '2024-12-11T00:00:00Z',
    updated_at: '2024-12-11T00:00:00Z'
  },
  {
    id: '2',
    meeting_date: '2024-10-15',
    title: 'October Regular Meeting',
    content: 'The Lodge was opened by the Worshipful Master with 28 members in attendance. The charity steward reported successful fundraising efforts totaling £1,800. Two new members were initiated in a beautiful ceremony. Discussion of the upcoming installation ceremony and annual dinner. The Lodge voted to support three local charities. The meeting concluded at 9:45 PM.',
    created_at: '2024-10-16T00:00:00Z',
    updated_at: '2024-10-16T00:00:00Z'
  },
  {
    id: '3',
    meeting_date: '2024-08-20',
    title: 'August Regular Meeting',
    content: 'Summer meeting held with 22 members present. The Secretary read correspondence from the Provincial Grand Lodge. A motion was passed to donate £500 to the local children\'s hospital. Two candidates were passed to the degree of Fellow Craft. Plans for the autumn social event were discussed and approved. The Lodge closed at 9:15 PM.',
    created_at: '2024-08-21T00:00:00Z',
    updated_at: '2024-08-21T00:00:00Z'
  }
];

const demoMemberProfile: MemberProfile = {
  id: 'demo-profile-1',
  user_id: 'demo-user-id',
  full_name: 'Demo User',
  position: 'Member',
  role: 'member',
  join_date: '2020-01-01',
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  status: 'active',
  email_verified: true,
  registration_date: '2020-01-01T00:00:00Z'
};

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

export const optimizedApi = {
  // Optimized member profiles with caching
  getMemberProfile: async (userId: string): Promise<MemberProfile | null> => {
    const cacheKey = `member_profile:${userId}`;

    // Return demo data immediately if in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for getMemberProfile');
      return Promise.resolve({...demoMemberProfile, user_id: userId});
    }

    return dataCache.get(cacheKey, async () => {      
      const query = supabase
        .from('member_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      
      const { data, error } = await withTimeout(query, 45000);
      
      if (error) {
        console.error('Error fetching member profile:', error);
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }
      
      return data && data.length > 0 ? data[0] as MemberProfile : null;
    }, 5 * 60 * 1000); // 5 minute cache for profiles
  },

  getAllMembers: async (): Promise<MemberProfile[]> => {
    // Return demo data immediately if in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for getAllMembers');
      return Promise.resolve([
        {...demoMemberProfile, id: 'demo-1', full_name: 'John Smith', position: 'Worshipful Master'},
        {...demoMemberProfile, id: 'demo-2', full_name: 'David Johnson', position: 'Senior Warden'},
        {...demoMemberProfile, id: 'demo-3', full_name: 'Michael Brown', position: 'Junior Warden'},
        {...demoMemberProfile, id: 'demo-4', full_name: 'Robert Wilson', position: 'Treasurer'},
        {...demoMemberProfile, id: 'demo-5', full_name: 'William Davis', position: 'Secretary'}
      ]);
    }

    return deduplicateRequest(CACHE_KEYS.MEMBERS, () =>
      dataCache.get(CACHE_KEYS.MEMBERS, async () => {
        const query = supabase
          .from('member_profiles')
          .select('*')
          .order('full_name', { ascending: true });
        
        const { data, error } = await withTimeout(query, 60000);
        
        if (error) {
          console.error('Error fetching all members:', error);
          throw new Error(`Failed to fetch members: ${error.message}`);
        }
        
        return data as MemberProfile[];
      }, 15 * 60 * 1000) // 15 minute cache for member list
    );
  },

  // Optimized documents with category-specific caching
  getLodgeDocuments: async (category?: string): Promise<LodgeDocument[]> => {
    // Return demo data immediately if in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for getLodgeDocuments');
      if (category) {
        return Promise.resolve(demoDocuments.filter(doc => doc.category === category));
      }
      return Promise.resolve(demoDocuments);
    }

    const cacheKey = category ? CACHE_KEYS.DOCUMENTS_BY_CATEGORY(category) : CACHE_KEYS.DOCUMENTS;
    
    return deduplicateRequest(cacheKey, () =>
      dataCache.get(cacheKey, async () => {
        let query = supabase
          .from('lodge_documents')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (category) {
          query = query.eq('category', category);
        }
        
        const { data, error } = await withTimeout(query, 45000);
        
        if (error) {
          console.error('Error fetching lodge documents:', error);
          throw new Error(`Failed to fetch documents: ${error.message}`);
        }
        
        return data as LodgeDocument[];
      }, 20 * 60 * 1000) // 20 minute cache for documents
    );
  },

  // Create a new document
  createDocument: async (document: Omit<LodgeDocument, 'id' | 'created_at' | 'updated_at'>): Promise<LodgeDocument> => {
    try {
      // Return mock response in demo mode
      if (shouldUseDemoMode()) {
        console.log('Using demo mode for createDocument');
        const newDoc: LodgeDocument = {
          ...document,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return Promise.resolve(newDoc);
      }
      
      const query = supabase
        .from('lodge_documents')
        .insert(document)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query, 45000);
      
      if (error) {
        console.error('Error creating document:', error);
        throw new Error(`Failed to create document: ${error.message}`);
      }
      
      // Invalidate relevant caches
      optimizedApi.invalidateCache.documents(document.category);
      
      return data as LodgeDocument;
    } catch (error) {
      console.error('API Error - createDocument:', error);
      throw error;
    }
  },
  
  // Update an existing document
  updateDocument: async (id: string, document: Partial<LodgeDocument>): Promise<LodgeDocument> => {
    try {
      // Return mock response in demo mode
      if (shouldUseDemoMode()) {
        console.log('Using demo mode for updateDocument');
        const updatedDoc: LodgeDocument = {
          ...demoDocuments.find(doc => doc.id === id) || demoDocuments[0],
          ...document,
          updated_at: new Date().toISOString()
        };
        return Promise.resolve(updatedDoc);
      }
      
      const query = supabase
        .from('lodge_documents')
        .update(document)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query, 45000);
      
      if (error) {
        console.error('Error updating document:', error);
        throw new Error(`Failed to update document: ${error.message}`);
      }
      
      // Invalidate relevant caches
      optimizedApi.invalidateCache.documents(document.category);
      
      return data as LodgeDocument;
    } catch (error) {
      console.error('API Error - updateDocument:', error);
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument: async (id: string): Promise<void> => {
    try {
      // Return mock response in demo mode
      if (shouldUseDemoMode()) {
        console.log('Using demo mode for deleteDocument');
        return Promise.resolve();
      }
      
      // First, get the document to know which category cache to invalidate
      const { data: document, error: getError } = await supabase
        .from('lodge_documents')
        .select('category')
        .eq('id', id)
        .single();
      
      if (getError) {
        console.error('Error getting document before deletion:', getError);
      }
      
      const { error } = await supabase
        .from('lodge_documents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
      }
      
      // Invalidate all document caches to be safe
      optimizedApi.invalidateCache.documents();
      
      // Also invalidate the specific category cache if we know it
      if (document && document.category) {
        optimizedApi.invalidateCache.documents(document.category);
      }
    } catch (error) {
      console.error('API Error - deleteDocument:', error);
      throw error;
    }
  },

  // Paginated documents for better performance
  getLodgeDocumentsPaginated: async (
    page: number = 1, 
    limit: number = 20, 
    category?: string
  ): Promise<{ documents: LodgeDocument[], total: number, hasMore: boolean }> => {
    // Return demo data immediately if in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for getLodgeDocumentsPaginated');
      let filteredDocs = category 
        ? demoDocuments.filter(doc => doc.category === category)
        : demoDocuments;
        
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedDocs = filteredDocs.slice(start, Math.min(end, filteredDocs.length));
      
      return Promise.resolve({
        documents: paginatedDocs,
        total: filteredDocs.length,
        hasMore: end < filteredDocs.length
      });
    }

    const offset = (page - 1) * limit;
    const cacheKey = `documents_paginated:${page}:${limit}:${category || 'all'}`;
    
    return deduplicateRequest(cacheKey, () =>
      dataCache.get(cacheKey, async () => {
        let query = supabase
          .from('lodge_documents')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (category) {
          query = query.eq('category', category);
        }
        
        const { data, error, count } = await withTimeout(query, 45000);
        
        if (error) {
          console.error('Error fetching paginated documents:', error);
          throw new Error(`Failed to fetch documents: ${error.message}`);
        }
        
        return {
          documents: data as LodgeDocument[],
          total: count || 0,
          hasMore: offset + limit < (count || 0)
        };
      }, 10 * 60 * 1000) // 10 minute cache for paginated results
    );
  },

  getMeetingMinutes: async (): Promise<MeetingMinutes[]> => {
    // Return demo data immediately if in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for getMeetingMinutes');
      return Promise.resolve(demoMinutes);
    }

    return deduplicateRequest(CACHE_KEYS.MEETING_MINUTES, () =>
      dataCache.get(CACHE_KEYS.MEETING_MINUTES, async () => {
        const query = supabase
          .from('meeting_minutes')
          .select('*')
          .order('meeting_date', { ascending: false });
        
        const { data, error } = await withTimeout(query, 45000);
        
        if (error) {
          console.error('Error fetching meeting minutes:', error);
          throw new Error(`Failed to fetch meeting minutes: ${error.message}`);
        }
        
        return data as MeetingMinutes[];
      }, 20 * 60 * 1000) // 20 minute cache
    );
  },
  
  // Create new meeting minutes
  createMinutes: async (minutes: Omit<MeetingMinutes, 'id' | 'created_at' | 'updated_at'>): Promise<MeetingMinutes> => {
    // Return mock response in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for createMinutes');
      return Promise.resolve({
        ...minutes,
        id: `demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    const query = supabase
      .from('meeting_minutes')
      .insert(minutes)
      .select()
      .single();
    
    const { data, error } = await withTimeout(query, 45000);
    
    if (error) {
      console.error('Error creating meeting minutes:', error);
      throw new Error(`Failed to create meeting minutes: ${error.message}`);
    }
    
    // Invalidate cache
    optimizedApi.invalidateCache.meetingMinutes();
    
    return data as MeetingMinutes;
  },

  // Update existing meeting minutes
  updateMinutes: async (id: string, minutes: Partial<MeetingMinutes>): Promise<MeetingMinutes> => {
    try {
      // Return mock response in demo mode
      if (shouldUseDemoMode()) {
        console.log('Using demo mode for updateMinutes');
        const updatedMinutes: MeetingMinutes = {
          ...demoMinutes.find(minute => minute.id === id) || demoMinutes[0],
          ...minutes,
          updated_at: new Date().toISOString()
        };
        return Promise.resolve(updatedMinutes);
      }
      
      const query = supabase
        .from('meeting_minutes')
        .update(minutes)
        .eq('id', id)
        .select()
        .single();
      
      const { data, error } = await withTimeout(query, 45000);
      
      if (error) {
        console.error('Error updating meeting minutes:', error);
        throw new Error(`Failed to update meeting minutes: ${error.message}`);
      }
      
      // Invalidate cache
      optimizedApi.invalidateCache.meetingMinutes();
      
      return data as MeetingMinutes;
    } catch (error) {
      console.error('API Error - updateMinutes:', error);
      throw error;
    }
  },

  // Delete meeting minutes
  deleteMinutes: async (id: string): Promise<void> => {
    try {
      // Return mock response in demo mode
      if (shouldUseDemoMode()) {
        console.log('Using demo mode for deleteMinutes');
        return Promise.resolve();
      }
      
      const { error } = await supabase
        .from('meeting_minutes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting meeting minutes:', error);
        throw new Error(`Failed to delete meeting minutes: ${error.message}`);
      }
      
      // Invalidate cache
      optimizedApi.invalidateCache.meetingMinutes();
    } catch (error) {
      console.error('API Error - deleteMinutes:', error);
      throw error;
    }
  },
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
      console.error('Optimized API Error - getEvents:', error);
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
      console.error('Optimized API Error - getNextUpcomingEvent:', error);
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
      console.error('Optimized API Error - getNewsArticles:', error);
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
      console.error('Optimized API Error - getOfficers:', error);
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
      console.error('Optimized API Error - getTestimonials:', error);
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
      console.error('Optimized API Error - getFAQItems:', error);
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
      console.error('Optimized API Error - getSiteSettings:', error);
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
      console.error('Optimized API Error - getPageContent:', error);
      throw error;
    }
  },

  // Cache invalidation methods
  invalidateCache: {
    memberProfile: (userId: string) => {
      dataCache.invalidate(`member_profile:${userId}`);
      dataCache.invalidate(CACHE_KEYS.MEMBERS);
    },
    
    documents: (category?: string) => {
      if (category) {
        dataCache.invalidate(CACHE_KEYS.DOCUMENTS_BY_CATEGORY(category));
      }
      dataCache.invalidate(CACHE_KEYS.DOCUMENTS);
      dataCache.invalidatePattern('documents_paginated:.*');
    },
    
    meetingMinutes: () => {
      dataCache.invalidate(CACHE_KEYS.MEETING_MINUTES);
    },
    
    events: () => {
      dataCache.invalidate(CACHE_KEYS.EVENTS);
    },
    
    news: () => {
      dataCache.invalidate(CACHE_KEYS.NEWS_ARTICLES);
    },
    
    officers: () => {
      dataCache.invalidate(CACHE_KEYS.OFFICERS);
    },
    
    testimonials: () => {
      dataCache.invalidate(CACHE_KEYS.TESTIMONIALS);
    },
    
    faq: () => {
      dataCache.invalidate(CACHE_KEYS.FAQ_ITEMS);
    },
    
    settings: () => {
      dataCache.invalidate(CACHE_KEYS.SITE_SETTINGS);
    },
    
    pageContent: (pageName?: string) => {
      if (pageName) {
        dataCache.invalidate(CACHE_KEYS.PAGE_CONTENT(pageName));
      } else {
        dataCache.invalidatePattern('page_content:.*');
      }
    },
    
    all: () => {
      dataCache.clear();
    }
  },

  // Batch operations for better performance
  batchUpdateMembers: async (updates: Array<{ userId: string, data: Partial<MemberProfile> }>) => {
    // Return mock response in demo mode
    if (shouldUseDemoMode()) {
      console.log('Using demo mode for batchUpdateMembers');
      return Promise.resolve(updates.map(() => ({ status: 'fulfilled', value: {} })));
    }

    const results = await Promise.allSettled(
      updates.map(({ userId, data }) => 
        supabase
          .from('member_profiles')
          .update(data)
          .eq('user_id', userId)
      )
    );
    
    // Invalidate relevant caches
    updates.forEach(({ userId }) => {
      optimizedApi.invalidateCache.memberProfile(userId);
    });
    
    return results;
  }
};

// Export both APIs for gradual migration
export { optimizedApi as api };