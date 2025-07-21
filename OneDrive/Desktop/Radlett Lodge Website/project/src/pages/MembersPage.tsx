import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { optimizedApi as api } from '../lib/optimizedApi';
import { LodgeDocument, MeetingMinutes, MemberProfile } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import VirtualizedList from '../components/VirtualizedList';
import PaginationControls from '../components/PaginationControls';
import DashboardCard from '../components/DashboardCard';
import ProfileSummaryCard from '../components/dashboard/ProfileSummaryCard';
import RecentUpdatesCard from '../components/dashboard/RecentUpdatesCard';
import RecentDocumentsCard from '../components/dashboard/RecentDocumentsCard';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';
import { FileText, Clock, Users, AlertTriangle, BookOpen, ScrollText, Archive, LogOut, Search, Filter, X, ExternalLink } from 'lucide-react';

const demoDocuments: LodgeDocument[] = [
  {
    id: '1',
    title: 'Grand Lodge Quarterly Communication - Q4 2024',
    description: 'Latest quarterly communication from the United Grand Lodge of England',
    url: '#',
    category: 'grand_lodge',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Provincial Grand Lodge Newsletter - Winter 2024',
    description: 'Hertfordshire Provincial Grand Lodge quarterly newsletter',
    url: '#',
    category: 'provincial',
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z'
  },
  {
    id: '3',
    title: 'Summons - December 2024 Regular Meeting',
    description: 'Official summons for the December regular meeting',
    url: '#',
    category: 'summons',
    created_at: '2024-11-25T00:00:00Z',
    updated_at: '2024-11-25T00:00:00Z'
  },
  {
    id: '4',
    title: 'Summons - October 2024 Regular Meeting',
    description: 'Official summons for the October regular meeting',
    url: '#',
    category: 'summons',
    created_at: '2024-09-25T00:00:00Z',
    updated_at: '2024-09-25T00:00:00Z'
  },
  {
    id: '5',
    title: 'Lodge of Instruction - Week 48 Minutes',
    description: 'Minutes from Lodge of Instruction meeting - Week 48, 2024',
    url: '#',
    category: 'lodge_instruction',
    created_at: '2024-11-28T00:00:00Z',
    updated_at: '2024-11-28T00:00:00Z'
  },
  {
    id: '6',
    title: 'Lodge of Instruction - Week 47 Minutes',
    description: 'Minutes from Lodge of Instruction meeting - Week 47, 2024',
    url: '#',
    category: 'lodge_instruction',
    created_at: '2024-11-21T00:00:00Z',
    updated_at: '2024-11-21T00:00:00Z'
  },
  {
    id: '7',
    title: 'Lodge Bylaws 2024',
    description: 'Updated lodge bylaws and regulations',
    url: '#',
    category: 'resources',
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z'
  },
  {
    id: '8',
    title: 'Ritual Guide - Entered Apprentice',
    description: 'Guide for the Entered Apprentice degree ceremony',
    url: '#',
    category: 'resources',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z'
  },
  {
    id: '9',
    title: 'Membership Application Form',
    description: 'Form for new membership applications',
    url: '#',
    category: 'resources',
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-07-15T00:00:00Z'
  },
  {
    id: '10',
    title: 'Charity Application Form',
    description: 'Form for submitting charity funding requests',
    url: '#',
    category: 'forms',
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
    updated_at: '2024-12-11T00:00:00Z',
    document_url: 'https://example.com/minutes-december-2024.pdf'
  },
  {
    id: '2',
    meeting_date: '2024-10-15',
    title: 'October Regular Meeting',
    content: 'The Lodge was opened by the Worshipful Master with 28 members in attendance. The charity steward reported successful fundraising efforts totaling £1,800. Two new members were initiated in a beautiful ceremony. Discussion of the upcoming installation ceremony and annual dinner. The Lodge voted to support three local charities. The meeting concluded at 9:45 PM.',
    created_at: '2024-10-16T00:00:00Z',
    updated_at: '2024-10-16T00:00:00Z',
    document_url: 'https://example.com/minutes-october-2024.pdf'
  },
  {
    id: '3',
    meeting_date: '2024-08-20',
    title: 'August Regular Meeting',
    content: 'Summer meeting held with 22 members present. The Secretary read correspondence from the Provincial Grand Lodge. A motion was passed to donate £500 to the local children\'s hospital. Two candidates were passed to the degree of Fellow Craft. Plans for the autumn social event were discussed and approved. The Lodge closed at 9:15 PM.',
    created_at: '2024-08-21T00:00:00Z',
    updated_at: '2024-08-21T00:00:00Z',
    document_url: 'https://example.com/minutes-august-2024.pdf'
  }
];

// Document categories with their display information
const DOCUMENT_CATEGORIES = [
  { key: 'grand_lodge', label: 'Grand Lodge Communications', icon: FileText },
  { key: 'provincial', label: 'Provincial Communications', icon: FileText },
  { key: 'summons', label: 'Summons', icon: ScrollText },
  { key: 'minutes', label: 'Meeting Minutes', icon: Clock },
  { key: 'gpc_minutes', label: 'GPC Minutes', icon: Clock },
  { key: 'lodge_instruction', label: 'Lodge of Instruction', icon: BookOpen },
  { key: 'resources', label: 'Resources', icon: Archive },
  { key: 'solomon', label: 'Solomon', icon: BookOpen },
  { key: 'bylaws', label: 'Bylaws', icon: FileText },
  { key: 'forms', label: 'Forms', icon: FileText },
  { key: 'ritual', label: 'Ritual', icon: BookOpen },
  { key: 'other', label: 'Other', icon: FileText }
];

const MembersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, profile: userProfile, loading: authLoading, needsPasswordReset } = useAuth();
  
  // Basic state
  const [allDocuments, setAllDocuments] = useState<LodgeDocument[]>([]);
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Document filtering state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simple pagination state (no external hook)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Handle navigation for non-authenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (!authLoading && user && userProfile?.status === 'pending') {
      navigate('/members/pending', { replace: true });
      return;
    }
    
    if (!authLoading && user && needsPasswordReset) {
      navigate('/password-reset', { replace: true });
      return;
    }
  }, [authLoading, user, userProfile?.status, needsPasswordReset, navigate]);

  // Load initial data - only once when user is available
  useEffect(() => {
    if (!user || authLoading || dataLoaded) {
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        setDataLoading(true);

        // Load page content (optional)
        try {
          const content = await api.getPageContent('members');
          const contentMap: Record<string, string> = {};
          content.forEach(item => {
            contentMap[item.section_name] = item.content;
          });
          setPageContent(contentMap);
        } catch (contentError) {
          console.warn('Could not load page content:', contentError);
        }
        
        // Load documents and minutes
        try {
          const [documentsData, minutesData] = await Promise.all([
            api.getLodgeDocuments(),
            api.getMeetingMinutes()
          ]);

          setAllDocuments(documentsData);
          setMinutes(minutesData);
          setUsingDemoData(false);
          
        } catch (dbError) {
          console.warn('Database not connected, using demo data:', dbError);
          setAllDocuments(demoDocuments);
          setMinutes(demoMinutes);
          setUsingDemoData(true);
        }
        
      } catch (err) {
        console.error('Error loading member data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load member data');
        setAllDocuments(demoDocuments);
        setMinutes(demoMinutes);
        setUsingDemoData(true);
      } finally {
        setDataLoading(false);
        setDataLoaded(true);
      }
    };

    // Add a small delay to ensure auth context is fully settled
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, authLoading, dataLoaded]);

  // Calculate filtered and paginated documents
  const filteredAndPaginatedDocuments = useMemo(() => {
    if (selectedCategories.length === 0) {
      return { documents: [], total: 0, totalPages: 0 };
    }

    let allSelectedDocuments: (LodgeDocument | MeetingMinutes)[] = [];
    
    // Collect documents from selected categories
    selectedCategories.forEach(category => {
      if (category === 'minutes') {
        allSelectedDocuments.push(...minutes);
      } else {
        const categoryDocs = allDocuments.filter(doc => doc.category === category);
        allSelectedDocuments.push(...categoryDocs);
      }
    });
    
    // Apply search filter
    if (searchTerm.trim()) {
      allSelectedDocuments = allSelectedDocuments.filter(doc => {
        const title = doc.title.toLowerCase();
        const description = ('description' in doc ? doc.description : doc.content)?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return title.includes(search) || description.includes(search);
      });
    }
    
    // Sort by date (newest first)
    allSelectedDocuments.sort((a, b) => {
      const dateA = new Date('meeting_date' in a ? a.meeting_date : a.created_at);
      const dateB = new Date('meeting_date' in b ? b.meeting_date : b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Calculate pagination
    const total = allSelectedDocuments.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const documents = allSelectedDocuments.slice(start, end);
    
    return { documents, total, totalPages };
  }, [selectedCategories, allDocuments, minutes, searchTerm, currentPage, pageSize]);

  // Reset to first page when categories or search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategories, searchTerm]);

  const handleSignOut = async () => {
    try {
      setError(null);
      setIsSigningOut(true);
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryKey)) {
        return prev.filter(cat => cat !== categoryKey);
      } else {
        return [...prev, categoryKey];
      }
    });
  };

  const handleClearAllCategories = () => {
    setSelectedCategories([]);
    setSearchTerm('');
  };

  // Get document counts by category
  const getCategoryCount = (categoryKey: string) => {
    if (categoryKey === 'minutes') {
      return minutes.length;
    }
    return allDocuments.filter(doc => doc.category === categoryKey).length;
  };

  // Simple pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Document row renderer for virtualized list
  const DocumentRow = ({ index, style, data }: { index: number; style: React.CSSProperties; data: (LodgeDocument | MeetingMinutes)[] }) => {
    const doc = data[index];
    const isMinute = 'meeting_date' in doc;
    
    return (
      <div style={style} className="px-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center justify-between hover:shadow-soft transition-shadow">
          <div className="flex-grow">
            <h3 className="font-medium text-primary-600">{doc.title}</h3>
            {isMinute ? (
              <>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{doc.content.substring(0, 150)}...</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    MEETING MINUTES
                  </span>
                  <span className="text-xs text-neutral-500 ml-4">
                    Meeting: {new Date(doc.meeting_date).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </>
            ) : (
              <>
                {doc.description && (
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{doc.description}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                    {doc.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-500 ml-4">
                    Added {new Date(doc.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <a
              href={isMinute ? (doc as any).document_url || '#' : doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-500 hover:text-primary-600 transition-colors"
              title={isMinute ? "View meeting minutes" : "Open document"}
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center pt-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  // Show loading while data is loading
  if (user && dataLoading) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center pt-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Error Notice */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h3 className="font-medium text-yellow-800 mb-1">Notice</h3>
                <p className="text-yellow-700">
                  {error} - Showing demo data instead.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Document Category Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-primary-600">
                    Document Categories
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Select categories to view
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                {DOCUMENT_CATEGORIES.map((category) => {
                  const count = getCategoryCount(category.key);
                  const IconComponent = category.icon;
                  
                  return (
                    <label
                      key={category.key}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCategories.includes(category.key)
                          ? 'border-secondary-500 bg-secondary-50'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.key)}
                        onChange={() => handleCategoryToggle(category.key)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                        selectedCategories.includes(category.key)
                          ? 'border-secondary-500 bg-secondary-500'
                          : 'border-neutral-300'
                      }`}>
                        {selectedCategories.includes(category.key) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <IconComponent size={16} className="text-neutral-500 mr-2" />
                      <div className="flex-grow">
                        <span className="text-sm font-medium text-neutral-700">
                          {category.label}
                        </span>
                        <span className="text-xs text-neutral-500 ml-2">
                          ({count})
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Clear All Button */}
              {selectedCategories.length > 0 && (
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllCategories}
                    className="w-full flex items-center justify-center"
                  >
                    <X size={16} className="mr-2" />
                    Clear All Selections
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Dashboard Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Profile Summary Card */}
              <ProfileSummaryCard 
                profile={userProfile} 
                userEmail={user?.email}
              />
              
              {/* Recent Updates Card */}
              <RecentUpdatesCard 
                minutes={minutes}
                onViewAllMinutes={() => setSelectedCategories(['minutes'])}
              />
              
              {/* Recent Documents Card */}
              <RecentDocumentsCard 
                documents={allDocuments}
                onViewAllDocuments={() => setSelectedCategories(['grand_lodge', 'provincial', 'summons', 'resources'])}
              />
              
              {/* Quick Actions Card - spans full width on mobile, single column on larger screens */}
              <div className="md:col-span-2 lg:col-span-3">
                <QuickActionsCard 
                  isAdmin={isAdmin || userProfile?.role === 'admin'}
                  onSelectMinutes={() => setSelectedCategories(['minutes'])}
                />
              </div>
            </div>

            {/* Document Browser Section */}
            <DashboardCard 
              title="Document Browser"
              icon={FileText}
              headerAction={
                selectedCategories.length > 0 && (
                  <span className="text-sm text-neutral-500">
                    {filteredAndPaginatedDocuments.total} documents found
                  </span>
                )
              }
            >
              {selectedCategories.length === 0 && (
                <p className="text-sm text-neutral-500 mb-6">
                  Select categories from the left to view documents
                </p>
              )}

              {/* Search Bar - Only show when categories are selected */}
              {selectedCategories.length > 0 && (
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search within selected documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                  </div>
                </div>
              )}

              {/* Document Display Area */}
              {selectedCategories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">
                    Select Document Categories
                  </h3>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    Choose one or more categories from the left sidebar to view documents. 
                    You can select multiple categories to see a combined view.
                  </p>
                </div>
              ) : filteredAndPaginatedDocuments.documents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-12 h-12 text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">
                    No Documents Found
                  </h3>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    {searchTerm 
                      ? `No documents match your search "${searchTerm}" in the selected categories.`
                      : 'No documents found for your current selection. Try selecting different categories.'
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Virtualized list for better performance */}
                  <VirtualizedList
                    items={filteredAndPaginatedDocuments.documents}
                    height={600}
                    itemHeight={120}
                    renderItem={DocumentRow}
                    className="border border-neutral-200 rounded-lg"
                  />
                  
                  {/* Pagination controls */}
                  {filteredAndPaginatedDocuments.total > pageSize && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={filteredAndPaginatedDocuments.totalPages}
                      pageSize={pageSize}
                      totalItems={filteredAndPaginatedDocuments.total}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      canGoNext={currentPage < filteredAndPaginatedDocuments.totalPages}
                      canGoPrev={currentPage > 1}
                      onFirstPage={() => setCurrentPage(1)}
                      onLastPage={() => setCurrentPage(filteredAndPaginatedDocuments.totalPages)}
                      onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, filteredAndPaginatedDocuments.totalPages))}
                      onPrevPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />
                  )}
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;