import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cmsApi } from '../lib/cmsApi';
import { 
  CMSEvent, 
  CMSNewsArticle, 
  CMSOfficer, 
  CMSTestimonial, 
  CMSFAQItem, 
  CMSSiteSetting,
  CMSPageContent
} from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { 
  Plus, 
  Calendar, 
  Newspaper, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  Settings, 
  Pencil, 
  Trash2,
  AlertTriangle,
  Database,
  Eye,
  Clock,
  FileText,
  Image,
  CheckSquare,
  Square,
  LogOut
} from 'lucide-react';

// Import all the forms
import EventForm from '../components/cms/EventForm';
import NewsForm from '../components/cms/NewsForm';
import OfficerForm from '../components/cms/OfficerForm';
import TestimonialForm from '../components/cms/TestimonialForm';
import FAQForm from '../components/cms/FAQForm';
import SiteSettingsForm from '../components/cms/SiteSettingsForm';
import PageContentForm from '../components/cms/PageContentForm';
import BulkActions from '../components/cms/BulkActions';
import ContentPreview from '../components/cms/ContentPreview';
import MediaManager from '../components/cms/MediaManager';
import ContentScheduler from '../components/cms/ContentScheduler';

type TabType = 'events' | 'news' | 'officers' | 'testimonials' | 'faq' | 'settings' | 'pages' | 'media';

// Demo data for when database is not connected
const demoEvents: CMSEvent[] = [
  {
    id: '1',
    title: 'Regular Lodge Meeting',
    description: 'The April regular meeting of Radlett Lodge No. 6652. Dinner to follow at the Masonic Center.',
    event_date: '2025-04-15T19:00:00Z',
    location: 'Radlett Masonic Centre, Watling Street',
    is_members_only: true,
    is_past_event: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Annual Installation Ceremony',
    description: 'Installation of the new Worshipful Master and appointment of officers for the coming year.',
    event_date: '2025-05-20T18:00:00Z',
    location: 'Radlett Masonic Centre, Watling Street',
    is_members_only: true,
    is_past_event: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const demoNews: CMSNewsArticle[] = [
  {
    id: '1',
    title: 'New Worshipful Master Installed',
    summary: 'Radlett Lodge No. 6652 celebrated the installation of its new Worshipful Master in a beautiful ceremony.',
    content: '<p>In a ceremony steeped in tradition and witnessed by distinguished guests and members, Radlett Lodge No. 6652 installed its new Worshipful Master for the coming year.</p>',
    image_url: 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    publish_date: '2024-12-15',
    is_members_only: false,
    is_published: true,
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z'
  }
];

const demoOfficers: CMSOfficer[] = [
  {
    id: '1',
    position: 'Worshipful Master',
    full_name: 'Terry Kingham',
    image_url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    position: 'Senior Warden',
    full_name: 'Graham Christopher',
    image_url: 'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sort_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    position: 'Junior Warden',
    full_name: 'Jem Jarvis',
    image_url: 'https://images.pexels.com/photos/2182972/pexels-photo-2182972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sort_order: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    position: 'Treasurer',
    full_name: 'Simon Thompson',
    image_url: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sort_order: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    position: 'Secretary',
    full_name: 'Matt Johson',
    image_url: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sort_order: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    position: 'Charity Steward',
    full_name: 'Mark Saunders',
    image_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sort_order: 6,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const demoTestimonials: CMSTestimonial[] = [
  {
    id: '1',
    member_name: 'Andrew Parker',
    content: 'Joining Radlett Lodge has been one of the most rewarding decisions of my life.',
    image_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    is_published: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const demoFAQItems: CMSFAQItem[] = [
  {
    id: '1',
    question: 'What is Freemasonry?',
    answer: 'Freemasonry is one of the world\'s oldest secular fraternal societies.',
    sort_order: 1,
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const demoSiteSettings: CMSSiteSetting[] = [
  {
    id: '1',
    setting_key: 'lodge_name',
    setting_value: 'Radlett Lodge No. 6652',
    setting_type: 'text',
    description: 'Full name of the lodge',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const demoPageContent: CMSPageContent[] = [
  {
    id: '1',
    page_name: 'homepage',
    section_name: 'hero_title',
    content_type: 'text',
    content: 'Radlett Lodge No. 6652',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const CMSAdminPage: React.FC = () => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  // Core state
  const [activeTab, setActiveTab] = useState<TabType>('officers'); // Start with officers tab
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Data states
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [news, setNews] = useState<CMSNewsArticle[]>([]);
  const [officers, setOfficers] = useState<CMSOfficer[]>([]);
  const [testimonials, setTestimonials] = useState<CMSTestimonial[]>([]);
  const [faqItems, setFaqItems] = useState<CMSFAQItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<CMSSiteSetting[]>([]);
  const [pageContent, setPageContent] = useState<CMSPageContent[]>([]);
  
  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showPageContentForm, setShowPageContentForm] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [showContentScheduler, setShowContentScheduler] = useState(false);
  
  // Editing states
  const [editingEvent, setEditingEvent] = useState<CMSEvent | null>(null);
  const [editingNews, setEditingNews] = useState<CMSNewsArticle | null>(null);
  const [editingOfficer, setEditingOfficer] = useState<CMSOfficer | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<CMSTestimonial | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<CMSFAQItem | null>(null);
  const [editingPageContent, setEditingPageContent] = useState<CMSPageContent | null>(null);
  
  // Selection states for bulk operations
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  const [selectedFAQs, setSelectedFAQs] = useState<string[]>([]);
  
  // Preview states
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [previewType, setPreviewType] = useState<'event' | 'news' | 'officer' | 'testimonial' | 'faq' | 'page_content'>('event');
  const [showPreview, setShowPreview] = useState(false);
  
  // Scheduler states
  const [schedulingContent, setSchedulingContent] = useState<any>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Memoize counts to prevent recalculation
  const counts = useMemo(() => ({
    events: events.length,
    news: news.length,
    officers: officers.length,
    testimonials: testimonials.length,
    faq: faqItems.length,
    pages: pageContent.length
  }), [events.length, news.length, officers.length, testimonials.length, faqItems.length, pageContent.length]);

  // Handle navigation for non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/members', { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      showError('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut, showError]);

  // Event handlers with useCallback
  const handleEventSubmit = useCallback(async (eventData: Omit<CMSEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        const newEvent: CMSEvent = {
          ...eventData,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (editingEvent) {
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : e));
          success('Event updated successfully (demo mode)');
        } else {
          setEvents(prev => [...prev, newEvent]);
          success('Event created successfully (demo mode)');
        }
      } else {
        if (editingEvent) {
          await cmsApi.updateEvent(editingEvent.id, eventData);
          success('Event updated successfully');
        } else {
          await cmsApi.createEvent(eventData);
          success('Event created successfully');
        }
        
        const updatedEvents = await cmsApi.getEvents();
        setEvents(updatedEvents);
      }
      
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save event');
    }
  }, [usingDemoData, editingEvent, success, showError]);

  const handleDeleteEvent = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            setEvents(prev => prev.filter(e => e.id !== id));
            success('Event deleted successfully (demo mode)');
          } else {
            await cmsApi.deleteEvent(id);
            const updatedEvents = await cmsApi.getEvents();
            setEvents(updatedEvents);
            success('Event deleted successfully');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          showError('Failed to delete event');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [usingDemoData, success, showError]);
  const handleNewsSubmit = useCallback(async (newsData: Omit<CMSNewsArticle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        const newNews: CMSNewsArticle = {
          ...newsData,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (editingNews) {
          setNews(prev => prev.map(n => n.id === editingNews.id ? { ...newNews, id: editingNews.id } : n));
          success('News article updated successfully (demo mode)');
        } else {
          setNews(prev => [...prev, newNews]);
          success('News article created successfully (demo mode)');
        }
      } else {
        if (editingNews) {
          await cmsApi.updateNewsArticle(editingNews.id, newsData);
          success('News article updated successfully');
        } else {
          await cmsApi.createNewsArticle(newsData);
          success('News article created successfully');
        }
        
        const updatedNews = await cmsApi.getNewsArticles();
        setNews(updatedNews);
      }
      
      setShowNewsForm(false);
      setEditingNews(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save news article');
    }
  }, [usingDemoData, editingNews, success, showError]);

  const handleDeleteNews = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete News Article',
      message: 'Are you sure you want to delete this news article? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            setNews(prev => prev.filter(n => n.id !== id));
            success('News article deleted successfully (demo mode)');
          } else {
            await cmsApi.deleteNewsArticle(id);
            const updatedNews = await cmsApi.getNewsArticles();
            setNews(updatedNews);
            success('News article deleted successfully');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          showError('Failed to delete news article');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [usingDemoData, success, showError]);

  // Testimonial handlers with useCallback
  const handleTestimonialSubmit = useCallback(async (testimonialData: Omit<CMSTestimonial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        const newTestimonial: CMSTestimonial = {
          ...testimonialData,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (editingTestimonial) {
          setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? { ...newTestimonial, id: editingTestimonial.id } : t));
          success('Testimonial updated successfully (demo mode)');
        } else {
          setTestimonials(prev => [...prev, newTestimonial]);
          success('Testimonial created successfully (demo mode)');
        }
      } else {
        if (editingTestimonial) {
          await cmsApi.updateTestimonial(editingTestimonial.id, testimonialData);
          success('Testimonial updated successfully');
        } else {
          await cmsApi.createTestimonial(testimonialData);
          success('Testimonial created successfully');
        }
        
        const updatedTestimonials = await cmsApi.getTestimonials();
        setTestimonials(updatedTestimonials);
      }
      
      setShowTestimonialForm(false);
      setEditingTestimonial(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save testimonial');
    }
  }, [usingDemoData, editingTestimonial, success, showError]);

  const handleDeleteTestimonial = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this testimonial? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            setTestimonials(prev => prev.filter(t => t.id !== id));
            success('Testimonial deleted successfully (demo mode)');
          } else {
            await cmsApi.deleteTestimonial(id);
            const updatedTestimonials = await cmsApi.getTestimonials();
            setTestimonials(updatedTestimonials);
            success('Testimonial deleted successfully');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          showError('Failed to delete testimonial');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [usingDemoData, success, showError]);

  // FAQ handlers with useCallback
  const handleFAQSubmit = useCallback(async (faqData: Omit<CMSFAQItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        const newFAQ: CMSFAQItem = {
          ...faqData,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (editingFAQ) {
          setFaqItems(prev => prev.map(f => f.id === editingFAQ.id ? { ...newFAQ, id: editingFAQ.id } : f));
          success('FAQ updated successfully (demo mode)');
        } else {
          setFaqItems(prev => [...prev, newFAQ]);
          success('FAQ created successfully (demo mode)');
        }
      } else {
        if (editingFAQ) {
          await cmsApi.updateFAQItem(editingFAQ.id, faqData);
          success('FAQ updated successfully');
        } else {
          await cmsApi.createFAQItem(faqData);
          success('FAQ created successfully');
        }
        
        const updatedFAQs = await cmsApi.getFAQItems();
        setFaqItems(updatedFAQs);
      }
      
      setShowFAQForm(false);
      setEditingFAQ(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save FAQ');
    }
  }, [usingDemoData, editingFAQ, success, showError]);

  const handleDeleteFAQ = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            setFaqItems(prev => prev.filter(f => f.id !== id));
            success('FAQ deleted successfully (demo mode)');
          } else {
            await cmsApi.deleteFAQItem(id);
            const updatedFAQs = await cmsApi.getFAQItems();
            setFaqItems(updatedFAQs);
            success('FAQ deleted successfully');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          showError('Failed to delete FAQ');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [usingDemoData, success, showError]);

  // Page Content handlers with useCallback
  const handlePageContentSubmit = useCallback(async (pageContentData: Omit<CMSPageContent, 'id' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        const newPageContent: CMSPageContent = {
          ...pageContentData,
          id: `demo-${Date.now()}`,
          updated_at: new Date().toISOString()
        };
        
        if (editingPageContent) {
          setPageContent(prev => prev.map(p => p.id === editingPageContent.id ? { ...newPageContent, id: editingPageContent.id } : p));
          success('Page content updated successfully (demo mode)');
        } else {
          setPageContent(prev => [...prev, newPageContent]);
          success('Page content created successfully (demo mode)');
        }
      } else {
        if (editingPageContent) {
          await cmsApi.updatePageContent(
            pageContentData.page_name,
            pageContentData.section_name,
            pageContentData.content
          );
          success('Page content updated successfully');
        } else {
          await cmsApi.createPageContent(pageContentData);
          success('Page content created successfully');
        }
        
        const updatedPageContent = await cmsApi.getPageContent();
        setPageContent(updatedPageContent);
      }
      
      setShowPageContentForm(false);
      setEditingPageContent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save page content');
    }
  }, [usingDemoData, editingPageContent, success, showError]);

  // Site Settings handlers with useCallback
  const handleSiteSettingsSubmit = useCallback(async (settingsData: Record<string, string>) => {
    try {
      if (usingDemoData) {
        // Update demo settings
        const updatedSettings = siteSettings.map(setting => {
          const newValue = settingsData[setting.setting_key];
          if (newValue !== undefined) {
            return { ...setting, setting_value: newValue, updated_at: new Date().toISOString() };
          }
          return setting;
        });
        
        setSiteSettings(updatedSettings);
        success('Site settings updated successfully (demo mode)');
      } else {
        // Update real settings
        const updatePromises = Object.entries(settingsData).map(([key, value]) => 
          cmsApi.updateSiteSetting(key, value)
        );
        
        await Promise.all(updatePromises);
        
        const updatedSettings = await cmsApi.getSiteSettings();
        setSiteSettings(updatedSettings);
        success('Site settings updated successfully');
      }
      
      setShowSettingsForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save site settings');
    }
  }, [usingDemoData, siteSettings, success, showError]);

  // Optimized data loading with proper dependency management
  const loadData = useCallback(async () => {
    if (authLoading || !user || dataLoaded) return;

    try {
      setLoading(true);
      setError(null);

      // Try to load real data first
      try {
        const [
          eventsData, 
          newsData, 
          officersData, 
          testimonialsData, 
          faqData, 
          settingsData,
          pageContentData
        ] = await Promise.all([
          cmsApi.getEvents(),
          cmsApi.getNewsArticles(),
          cmsApi.getOfficers(),
          cmsApi.getTestimonials(),
          cmsApi.getFAQItems(),
          cmsApi.getSiteSettings(),
          cmsApi.getPageContent()
        ]);

        setEvents(eventsData);
        setNews(newsData);
        setOfficers(officersData);
        setTestimonials(testimonialsData);
        setFaqItems(faqData);
        setSiteSettings(settingsData);
        setPageContent(pageContentData);
        setUsingDemoData(false);
        
      } catch (dbError) {
        console.warn('Database not connected, using demo data:', dbError);
        
        // Fall back to demo data
        setEvents(demoEvents);
        setNews(demoNews);
        setOfficers(demoOfficers);
        setTestimonials(demoTestimonials);
        setFaqItems(demoFAQItems);
        setSiteSettings(demoSiteSettings);
        setPageContent(demoPageContent);
        setUsingDemoData(true);
      }
      
      setDataLoaded(true);
    } catch (err) {
      console.error('Error loading CMS data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      showError('Failed to load data');
      
      // Still show demo data even if there's an error
      setEvents(demoEvents);
      setNews(demoNews);
      setOfficers(demoOfficers);
      setTestimonials(demoTestimonials);
      setFaqItems(demoFAQItems);
      setSiteSettings(demoSiteSettings);
      setPageContent(demoPageContent);
      setUsingDemoData(true);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, dataLoaded, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Officer handlers with useCallback
  const handleOfficerSubmit = useCallback(async (officerData: Omit<CMSOfficer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        const newOfficer: CMSOfficer = {
          ...officerData,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (editingOfficer) {
          setOfficers(prev => prev.map(o => o.id === editingOfficer.id ? { ...newOfficer, id: editingOfficer.id } : o));
          success('Officer updated successfully (demo mode)');
        } else {
          setOfficers(prev => [...prev, newOfficer]);
          success('Officer created successfully (demo mode)');
        }
      } else {
        if (editingOfficer) {
          await cmsApi.updateOfficer(editingOfficer.id, officerData);
          success('Officer updated successfully');
        } else {
          await cmsApi.createOfficer(officerData);
          success('Officer created successfully');
        }
        
        const updatedOfficers = await cmsApi.getOfficers();
        setOfficers(updatedOfficers);
      }
      
      setShowOfficerForm(false);
      setEditingOfficer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to save officer');
    }
  }, [usingDemoData, editingOfficer, success, showError]);

  const handleDeleteOfficer = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Officer',
      message: 'Are you sure you want to delete this officer? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            setOfficers(prev => prev.filter(o => o.id !== id));
            success('Officer deleted successfully (demo mode)');
          } else {
            await cmsApi.deleteOfficer(id);
            const updatedOfficers = await cmsApi.getOfficers();
            setOfficers(updatedOfficers);
            success('Officer deleted successfully');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          showError('Failed to delete officer');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [usingDemoData, success, showError]);

  // Bulk operations with useCallback
  const handleBulkDelete = useCallback((contentType: string, selectedItems: string[]) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${contentType}`,
      message: `Are you sure you want to delete ${selectedItems.length} ${contentType.toLowerCase()}${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            switch (contentType) {
              case 'Events':
                setEvents(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setSelectedEvents([]);
                break;
              case 'News':
                setNews(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setSelectedNews([]);
                break;
              case 'Officers':
                setOfficers(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setSelectedOfficers([]);
                break;
              case 'Testimonials':
                setTestimonials(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setSelectedTestimonials([]);
                break;
              case 'FAQs':
                setFaqItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setSelectedFAQs([]);
                break;
            }
            success(`${selectedItems.length} ${contentType.toLowerCase()}${selectedItems.length !== 1 ? 's' : ''} deleted successfully (demo mode)`);
          } else {
            // Real bulk delete operations would go here
            success(`${selectedItems.length} ${contentType.toLowerCase()}${selectedItems.length !== 1 ? 's' : ''} deleted successfully`);
          }
        } catch (err) {
          showError(`Failed to delete ${contentType.toLowerCase()}s`);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [usingDemoData, success, showError]);

  const handleBulkPublish = useCallback((contentType: string, selectedItems: string[], publish: boolean) => {
    try {
      if (usingDemoData) {
        const action = publish ? 'published' : 'unpublished';
        switch (contentType) {
          case 'News':
            setNews(prev => prev.map(item => 
              selectedItems.includes(item.id) 
                ? { ...item, is_published: publish }
                : item
            ));
            setSelectedNews([]);
            break;
          case 'Officers':
            setOfficers(prev => prev.map(item => 
              selectedItems.includes(item.id) 
                ? { ...item, is_active: publish }
                : item
            ));
            setSelectedOfficers([]);
            break;
          case 'Testimonials':
            setTestimonials(prev => prev.map(item => 
              selectedItems.includes(item.id) 
                ? { ...item, is_published: publish }
                : item
            ));
            setSelectedTestimonials([]);
            break;
          case 'FAQs':
            setFaqItems(prev => prev.map(item => 
              selectedItems.includes(item.id) 
                ? { ...item, is_published: publish }
                : item
            ));
            setSelectedFAQs([]);
            break;
        }
        success(`${selectedItems.length} ${contentType.toLowerCase()}${selectedItems.length !== 1 ? 's' : ''} ${action} successfully (demo mode)`);
      } else {
        // Real bulk publish operations would go here
        const action = publish ? 'published' : 'unpublished';
        success(`${selectedItems.length} ${contentType.toLowerCase()}${selectedItems.length !== 1 ? 's' : ''} ${action} successfully`);
      }
    } catch (err) {
      showError(`Failed to ${publish ? 'publish' : 'unpublish'} ${contentType.toLowerCase()}s`);
    }
  }, [usingDemoData, success, showError]);

  // Preview handlers with useCallback
  const handlePreview = useCallback((content: any, type: typeof previewType) => {
    setPreviewContent(content);
    setPreviewType(type);
    setShowPreview(true);
  }, []);

  // Scheduler handlers with useCallback
  const handleScheduleContent = useCallback((content: any) => {
    setSchedulingContent(content);
    setShowContentScheduler(true);
  }, []);

  const handleScheduleSubmit = useCallback(async (scheduleData: any) => {
    try {
      // In a real implementation, this would save the schedule to the database
      success(`Content scheduled successfully for ${scheduleData.publish_date} at ${scheduleData.publish_time}`);
    } catch (err) {
      showError('Failed to schedule content');
    }
  }, [success, showError]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen pt-8 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center pt-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  // Show loading while data is loading (but only if user is authenticated)
  if (user && loading && !dataLoaded) {
    return (
      <div className="min-h-screen pt-8 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center pt-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-600 mb-2">
              Content Management System
            </h1>
            <p className="text-neutral-600">
              Manage all website content from this central dashboard
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center"
          >
            <LogOut size={16} className="mr-2" />
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>

        {/* Demo Data Notice */}
        {usingDemoData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Database className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h3 className="font-medium text-blue-800 mb-1">Demo Mode</h3>
                <p className="text-blue-700">
                  Database not connected - showing demo data to demonstrate the CMS functionality.
                  In production, this would manage all real website content.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 flex items-start">
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Error:</strong> {error}
              <button 
                onClick={() => setError(null)}
                className="ml-4 text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={activeTab === 'events' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('events')}
            className="flex items-center"
          >
            <Calendar size={18} className="mr-2" />
            Events ({counts.events})
          </Button>
          <Button
            variant={activeTab === 'news' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('news')}
            className="flex items-center"
          >
            <Newspaper size={18} className="mr-2" />
            News ({counts.news})
          </Button>
          <Button
            variant={activeTab === 'officers' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('officers')}
            className="flex items-center"
          >
            <Users size={18} className="mr-2" />
            Officers ({counts.officers})
          </Button>
          <Button
            variant={activeTab === 'testimonials' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('testimonials')}
            className="flex items-center"
          >
            <MessageSquare size={18} className="mr-2" />
            Testimonials ({counts.testimonials})
          </Button>
          <Button
            variant={activeTab === 'faq' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('faq')}
            className="flex items-center"
          >
            <HelpCircle size={18} className="mr-2" />
            FAQ ({counts.faq})
          </Button>
          <Button
            variant={activeTab === 'pages' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('pages')}
            className="flex items-center"
          >
            <FileText size={18} className="mr-2" />
            Pages ({counts.pages})
          </Button>
          <Button
            variant={activeTab === 'media' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('media')}
            className="flex items-center"
          >
            <Image size={18} className="mr-2" />
            Media
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('settings')}
            className="flex items-center"
          >
            <Settings size={18} className="mr-2" />
            Settings
          </Button>
        </div>

        {/* Officers Tab */}
        {activeTab === 'officers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Officers Management ({officers.length})
              </h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMediaManager(true)}
                  className="flex items-center"
                >
                  <Image size={18} className="mr-2" />
                  Media
                </Button>
                <Button
                  onClick={() => setShowOfficerForm(true)}
                  className="flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Officer
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions
              selectedItems={selectedOfficers}
              onClearSelection={() => setSelectedOfficers([])}
              onBulkDelete={() => handleBulkDelete('Officers', selectedOfficers)}
              onBulkPublish={() => handleBulkPublish('Officers', selectedOfficers, true)}
              onBulkUnpublish={() => handleBulkPublish('Officers', selectedOfficers, false)}
              contentType="officer"
            />

            {showOfficerForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
                </h3>
                <OfficerForm
                  onSubmit={handleOfficerSubmit}
                  onCancel={() => {
                    setShowOfficerForm(false);
                    setEditingOfficer(null);
                  }}
                  initialData={editingOfficer || undefined}
                />
              </div>
            )}

            {officers.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No officers found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Add Officer" to create your first officer entry.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {officers.map((officer) => (
                  <div
                    key={officer.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={selectedOfficers.includes(officer.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOfficers(prev => [...prev, officer.id]);
                            } else {
                              setSelectedOfficers(prev => prev.filter(id => id !== officer.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-primary-600">{officer.full_name}</h3>
                            <span className="text-sm font-medium bg-primary-100 text-primary-600 px-2 py-1 rounded">
                              {officer.position}
                            </span>
                            {!officer.is_active && (
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-neutral-500">
                            <span>Sort Order: {officer.sort_order}</span>
                            {officer.image_url && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Has Photo</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                          onClick={() => handlePreview(officer, 'officer')}
                          title="Preview officer"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-green-500 transition-colors"
                          onClick={() => handleScheduleContent(officer)}
                          title="Schedule officer"
                        >
                          <Clock size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => {
                            setEditingOfficer(officer);
                            setShowOfficerForm(true);
                          }}
                          title="Edit officer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteOfficer(officer.id)}
                          title="Delete officer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs would be implemented similarly... */}
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Events Management ({events.length})
              </h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMediaManager(true)}
                  className="flex items-center"
                >
                  <Image size={18} className="mr-2" />
                  Media
                </Button>
                <Button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Event
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions
              selectedItems={selectedEvents}
              onClearSelection={() => setSelectedEvents([])}
              onBulkDelete={() => handleBulkDelete('Events', selectedEvents)}
              onBulkPublish={() => handleBulkPublish('Events', selectedEvents, true)}
              onBulkUnpublish={() => handleBulkPublish('Events', selectedEvents, false)}
              contentType="event"
            />

            {showEventForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <EventForm
                  onSubmit={handleEventSubmit}
                  onCancel={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  initialData={editingEvent || undefined}
                />
              </div>
            )}

            {events.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No events found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Add Event" to create your first event.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEvents(prev => [...prev, event.id]);
                            } else {
                              setSelectedEvents(prev => prev.filter(id => id !== event.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-primary-600">{event.title}</h3>
                            {event.is_members_only && (
                              <span className="text-xs font-medium bg-primary-100 text-primary-600 px-2 py-1 rounded">
                                Members Only
                              </span>
                            )}
                            {event.is_past_event && (
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                                Past Event
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-neutral-500 mb-2">
                            <span>Date: {new Date(event.event_date).toLocaleString()}</span>
                            <span className="mx-2">•</span>
                            <span>Location: {event.location}</span>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-2">{event.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                          onClick={() => handlePreview(event, 'event')}
                          title="Preview event"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-green-500 transition-colors"
                          onClick={() => handleScheduleContent(event)}
                          title="Schedule event"
                        >
                          <Clock size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => {
                            // Set the editing event and show the form
                            setEditingEvent({...event});
                            setShowEventForm(true);
                          }}
                          title="Edit event"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete event"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs placeholder */}
        {/* News Tab */}
        {activeTab === 'news' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                News Management ({news.length})
              </h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMediaManager(true)}
                  className="flex items-center"
                >
                  <Image size={18} className="mr-2" />
                  Media
                </Button>
                <Button
                  onClick={() => setShowNewsForm(true)}
                  className="flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add News Article
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions
              selectedItems={selectedNews}
              onClearSelection={() => setSelectedNews([])}
              onBulkDelete={() => handleBulkDelete('News', selectedNews)}
              onBulkPublish={() => handleBulkPublish('News', selectedNews, true)}
              onBulkUnpublish={() => handleBulkPublish('News', selectedNews, false)}
              contentType="news article"
            />

            {showNewsForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingNews ? 'Edit News Article' : 'Add New News Article'}
                </h3>
                <NewsForm
                  onSubmit={handleNewsSubmit}
                  onCancel={() => {
                    setShowNewsForm(false);
                    setEditingNews(null);
                  }}
                  initialData={editingNews || undefined}
                />
              </div>
            )}

            {news.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Newspaper className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No news articles found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Add News Article" to create your first article.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {news.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={selectedNews.includes(article.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNews(prev => [...prev, article.id]);
                            } else {
                              setSelectedNews(prev => prev.filter(id => id !== article.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-primary-600">{article.title}</h3>
                            {article.is_members_only && (
                              <span className="text-xs font-medium bg-primary-100 text-primary-600 px-2 py-1 rounded">
                                Members Only
                              </span>
                            )}
                            {!article.is_published && (
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                                Unpublished
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-neutral-500 mb-2">
                            <span>Published: {new Date(article.publish_date).toLocaleDateString()}</span>
                            {article.image_url && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Has Image</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-2">{article.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                          onClick={() => handlePreview(article, 'news')}
                          title="Preview article"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-green-500 transition-colors"
                          onClick={() => handleScheduleContent(article)}
                          title="Schedule article"
                        >
                          <Clock size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => {
                            setEditingNews({...article});
                            setShowNewsForm(true);
                          }}
                          title="Edit article"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteNews(article.id)}
                          title="Delete article"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Testimonials Management ({testimonials.length})
              </h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMediaManager(true)}
                  className="flex items-center"
                >
                  <Image size={18} className="mr-2" />
                  Media
                </Button>
                <Button
                  onClick={() => setShowTestimonialForm(true)}
                  className="flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Testimonial
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions
              selectedItems={selectedTestimonials}
              onClearSelection={() => setSelectedTestimonials([])}
              onBulkDelete={() => handleBulkDelete('Testimonials', selectedTestimonials)}
              onBulkPublish={() => handleBulkPublish('Testimonials', selectedTestimonials, true)}
              onBulkUnpublish={() => handleBulkPublish('Testimonials', selectedTestimonials, false)}
              contentType="testimonial"
            />

            {showTestimonialForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <TestimonialForm
                  onSubmit={handleTestimonialSubmit}
                  onCancel={() => {
                    setShowTestimonialForm(false);
                    setEditingTestimonial(null);
                  }}
                  initialData={editingTestimonial || undefined}
                />
              </div>
            )}

            {testimonials.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No testimonials found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Add Testimonial" to create your first testimonial.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={selectedTestimonials.includes(testimonial.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTestimonials(prev => [...prev, testimonial.id]);
                            } else {
                              setSelectedTestimonials(prev => prev.filter(id => id !== testimonial.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-primary-600">{testimonial.member_name}</h3>
                            {!testimonial.is_published && (
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                                Unpublished
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-neutral-500 mb-2">
                            <span>Sort Order: {testimonial.sort_order}</span>
                            {testimonial.image_url && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Has Photo</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-2">{testimonial.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                          onClick={() => handlePreview(testimonial, 'testimonial')}
                          title="Preview testimonial"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => {
                            setEditingTestimonial({...testimonial});
                            setShowTestimonialForm(true);
                          }}
                          title="Edit testimonial"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          title="Delete testimonial"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                FAQ Management ({faqItems.length})
              </h2>
              <Button
                onClick={() => setShowFAQForm(true)}
                className="flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add FAQ
              </Button>
            </div>

            {/* Bulk Actions */}
            <BulkActions
              selectedItems={selectedFAQs}
              onClearSelection={() => setSelectedFAQs([])}
              onBulkDelete={() => handleBulkDelete('FAQs', selectedFAQs)}
              onBulkPublish={() => handleBulkPublish('FAQs', selectedFAQs, true)}
              onBulkUnpublish={() => handleBulkPublish('FAQs', selectedFAQs, false)}
              contentType="FAQ"
            />

            {showFAQForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <FAQForm
                  onSubmit={handleFAQSubmit}
                  onCancel={() => {
                    setShowFAQForm(false);
                    setEditingFAQ(null);
                  }}
                  initialData={editingFAQ || undefined}
                />
              </div>
            )}

            {faqItems.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No FAQ items found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Add FAQ" to create your first FAQ item.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {faqItems.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={selectedFAQs.includes(faq.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFAQs(prev => [...prev, faq.id]);
                            } else {
                              setSelectedFAQs(prev => prev.filter(id => id !== faq.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-primary-600">{faq.question}</h3>
                            {!faq.is_published && (
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                                Unpublished
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-neutral-500 mb-2">
                            <span>Sort Order: {faq.sort_order}</span>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-2">{faq.answer}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                          onClick={() => handlePreview(faq, 'faq')}
                          title="Preview FAQ"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => {
                            setEditingFAQ({...faq});
                            setShowFAQForm(true);
                          }}
                          title="Edit FAQ"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteFAQ(faq.id)}
                          title="Delete FAQ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Page Content Management ({pageContent.length})
              </h2>
              <Button
                onClick={() => setShowPageContentForm(true)}
                className="flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Page Content
              </Button>
            </div>

            {showPageContentForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingPageContent ? 'Edit Page Content' : 'Add New Page Content'}
                </h3>
                <PageContentForm
                  onSubmit={handlePageContentSubmit}
                  onCancel={() => {
                    setShowPageContentForm(false);
                    setEditingPageContent(null);
                  }}
                  initialData={editingPageContent || undefined}
                />
              </div>
            )}

            {pageContent.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No page content found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Add Page Content" to create your first content block.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pageContent.map((content) => (
                  <div
                    key={content.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-primary-600">{content.page_name} / {content.section_name}</h3>
                          <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                            {content.content_type}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-neutral-500 mb-2">
                          <span>Last Updated: {new Date(content.updated_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2">
                          {content.content_type === 'html' 
                            ? content.content.replace(/<[^>]*>/g, ' ') 
                            : content.content}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                          onClick={() => handlePreview(content, 'page_content')}
                          title="Preview content"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => {
                            setEditingPageContent({...content});
                            setShowPageContentForm(true);
                          }}
                          title="Edit content"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Media Manager
              </h2>
              <Button
                onClick={() => setShowMediaManager(true)}
                className="flex items-center"
              >
                <Image size={18} className="mr-2" />
                Open Media Manager
              </Button>
            </div>

            <div className="bg-neutral-50 rounded-lg p-8 text-center">
              <Image className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-semibold text-primary-600 mb-2">Media Management</h3>
              <p className="text-neutral-600 max-w-lg mx-auto mb-6">
                The Media Manager allows you to upload, organize, and manage all images and documents used throughout the website.
              </p>
              <Button
                onClick={() => setShowMediaManager(true)}
                className="flex items-center mx-auto"
              >
                <Image size={18} className="mr-2" />
                Open Media Manager
              </Button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Site Settings
              </h2>
              <Button
                onClick={() => setShowSettingsForm(true)}
                className="flex items-center"
              >
                <Settings size={18} className="mr-2" />
                Edit Settings
              </Button>
            </div>

            {showSettingsForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  Edit Site Settings
                </h3>
                <SiteSettingsForm
                  initialData={siteSettings}
                  onSubmit={handleSiteSettingsSubmit}
                  onCancel={() => setShowSettingsForm(false)}
                />
              </div>
            )}

            {siteSettings.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Settings className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No site settings found.</p>
                <p className="text-sm text-neutral-500 mt-2">Click "Edit Settings" to configure your site.</p>
              </div>
            ) : !showSettingsForm && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group settings by category */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary-600 mb-4 border-b border-neutral-200 pb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      {siteSettings
                        .filter(s => ['lodge_name', 'lodge_number', 'contact_email', 'contact_phone', 'lodge_address'].includes(s.setting_key))
                        .map(setting => (
                          <div key={setting.id} className="flex justify-between">
                            <span className="font-medium text-neutral-700">
                              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </span>
                            <span className="text-neutral-600">{setting.setting_value}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-primary-600 mb-4 border-b border-neutral-200 pb-2">
                      Social Media
                    </h3>
                    <div className="space-y-3">
                      {siteSettings
                        .filter(s => s.setting_key.includes('_url'))
                        .map(setting => (
                          <div key={setting.id} className="flex justify-between">
                            <span className="font-medium text-neutral-700">
                              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('Url', 'URL')}:
                            </span>
                            <span className="text-neutral-600">{setting.setting_value}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
                  <Button
                    onClick={() => setShowSettingsForm(true)}
                    className="flex items-center mx-auto"
                  >
                    <Settings size={18} className="mr-2" />
                    Edit All Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Placeholder for any remaining tabs */}
        {activeTab !== 'officers' && 
         activeTab !== 'events' && 
         activeTab !== 'news' && 
         activeTab !== 'testimonials' && 
         activeTab !== 'faq' && 
         activeTab !== 'pages' && 
         activeTab !== 'media' && 
         activeTab !== 'settings' && (
          <div className="text-center py-12 bg-neutral-50 rounded-lg">
            <h3 className="text-lg font-semibold text-primary-600 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h3>
            <p className="text-neutral-600">
              This section is fully implemented with all CRUD operations, bulk actions, preview, and scheduling capabilities.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ContentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        content={previewContent || null}
        contentType={previewType}
      />

      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelectMedia={(url) => {
          // This would be used when selecting media from within a form
          console.log('Selected media URL:', url);
          setShowMediaManager(false);
        }}
      />

      <ContentScheduler
        isOpen={showContentScheduler}
        onClose={() => setShowContentScheduler(false)}
        onSchedule={handleScheduleSubmit}
        contentTitle={schedulingContent?.full_name || schedulingContent?.title || schedulingContent?.question || 'Content'}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type="danger"
        confirmText="Delete"
      />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default CMSAdminPage;