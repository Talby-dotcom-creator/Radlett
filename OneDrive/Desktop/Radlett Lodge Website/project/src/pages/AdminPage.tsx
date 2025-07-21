import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { optimizedApi as api } from '../lib/optimizedApi';
import { dataCache } from '../lib/dataCache';
import { LodgeDocument, MeetingMinutes, MemberProfile } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { usePagination } from '../hooks/usePagination';
import PaginationControls from '../components/PaginationControls';
import VirtualizedList from '../components/VirtualizedList';
import { Plus, FileText, Clock, Pencil, Trash2, ExternalLink, Building2, Landmark, Users, AlertTriangle, BookOpen, ScrollText, Archive, LogOut } from 'lucide-react';
import DocumentForm from '../components/DocumentForm';
import MinutesForm from '../components/MinutesForm';
import MemberProfileAdminForm from '../components/MemberProfileAdminForm';

type TabType = 'members' | 'documents' | 'grand_lodge' | 'provincial' | 'summons' | 'lodge_instruction' | 'resources' | 'minutes' | 'gpc_minutes';

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
    title: 'Grand Lodge Circular - December 2024',
    description: 'Monthly circular from UGLE with important updates',
    url: 'https://example.com/grand-lodge-circular-dec-2024.pdf',
    category: 'grand_lodge',
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z'
  },
  {
    id: '4',
    title: 'Provincial Grand Lodge Newsletter - Winter 2024',
    description: 'Hertfordshire Provincial Grand Lodge quarterly newsletter',
    url: 'https://example.com/provincial-newsletter-winter-2024.pdf',
    category: 'provincial',
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z'
  },
  {
    id: '5',
    title: 'Provincial Installation Ceremony Notice',
    description: 'Details of the upcoming Provincial installation ceremony',
    url: 'https://example.com/provincial-installation-2024.pdf',
    category: 'provincial',
    created_at: '2024-10-20T00:00:00Z',
    updated_at: '2024-10-20T00:00:00Z'
  },
  {
    id: '6',
    title: 'Provincial Charity Appeal 2024',
    description: 'Information about the annual provincial charity appeal',
    url: 'https://example.com/provincial-charity-appeal-2024.pdf',
    category: 'provincial',
    created_at: '2024-09-30T00:00:00Z',
    updated_at: '2024-09-30T00:00:00Z'
  },
  {
    id: '7',
    title: 'Summons - December 2024 Regular Meeting',
    description: 'Official summons for the December regular meeting',
    url: 'https://example.com/summons-december-2024.pdf',
    category: 'summons',
    created_at: '2024-11-25T00:00:00Z',
    updated_at: '2024-11-25T00:00:00Z'
  },
  {
    id: '8',
    title: 'Summons - October 2024 Regular Meeting',
    description: 'Official summons for the October regular meeting',
    url: 'https://example.com/summons-october-2024.pdf',
    category: 'summons',
    created_at: '2024-09-25T00:00:00Z',
    updated_at: '2024-09-25T00:00:00Z'
  },
  {
    id: '9',
    title: 'Lodge of Instruction - Week 48 Minutes',
    description: 'Minutes from Lodge of Instruction meeting - Week 48, 2024',
    url: 'https://example.com/loi-week-48-2024.pdf',
    category: 'lodge_instruction',
    created_at: '2024-11-28T00:00:00Z',
    updated_at: '2024-11-28T00:00:00Z'
  },
  {
    id: '10',
    title: 'Lodge of Instruction - Week 47 Minutes',
    description: 'Minutes from Lodge of Instruction meeting - Week 47, 2024',
    url: 'https://example.com/loi-week-47-2024.pdf',
    category: 'lodge_instruction',
    created_at: '2024-11-21T00:00:00Z',
    updated_at: '2024-11-21T00:00:00Z'
  },
  {
    id: '11',
    title: 'Lodge Bylaws 2024',
    description: 'Updated lodge bylaws and regulations',
    url: 'https://example.com/bylaws-2024.pdf',
    category: 'resources',
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z'
  },
  {
    id: '12',
    title: 'Ritual Guide - Entered Apprentice',
    description: 'Guide for the Entered Apprentice degree ceremony',
    url: 'https://example.com/ea-ritual.pdf',
    category: 'resources',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z'
  },
  {
    id: '13',
    title: 'Membership Application Form',
    description: 'Form for new membership applications',
    url: 'https://example.com/membership-form.pdf',
    category: 'resources',
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-07-15T00:00:00Z'
  },
  {
    id: '14',
    title: 'Charity Application Form',
    description: 'Form for submitting charity funding requests',
    url: 'https://example.com/charity-form.pdf',
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

const demoMembers: MemberProfile[] = [
  {
    id: '1',
    user_id: 'demo-user-1',
    full_name: 'Paul Talbot',
    position: 'Worshipful Master',
    role: 'admin',
    join_date: '2020-03-15',
    created_at: '2020-03-15T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'demo-user-2',
    full_name: 'James Wilson',
    position: 'Senior Warden',
    role: 'member',
    join_date: '2021-06-20',
    created_at: '2021-06-20T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'demo-user-3',
    full_name: 'Thomas Bennett',
    position: 'Junior Warden',
    role: 'member',
    join_date: '2022-01-10',
    created_at: '2022-01-10T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    user_id: 'demo-user-4',
    full_name: 'Robert Harris',
    position: 'Treasurer',
    role: 'member',
    join_date: '2019-09-05',
    created_at: '2019-09-05T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    user_id: 'demo-user-5',
    full_name: 'Michael Clark',
    position: 'Secretary',
    role: 'member',
    join_date: '2021-11-12',
    created_at: '2021-11-12T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const AdminPage: React.FC = () => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut, needsPasswordReset } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showMinutesForm, setShowMinutesForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<LodgeDocument | null>(null);
  const [editingMinute, setEditingMinute] = useState<MeetingMinutes | null>(null);
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allDocuments, setAllDocuments] = useState<LodgeDocument[]>([]);
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [paginatedDocuments, setPaginatedDocuments] = useState<{
    documents: LodgeDocument[];
    total: number;
    hasMore: boolean;
  }>({ documents: [], total: 0, hasMore: false });
  
  // Define filteredDocuments based on activeTab
  const filteredDocuments = activeTab === 'documents' 
    ? allDocuments 
    : allDocuments.filter(doc => doc.category === activeTab);
  
  // Pagination for documents
  const [documentsPagination, documentsPaginationActions] = usePagination({
    initialPage: 1,
    initialPageSize: 20
  });
  
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

  // Load paginated documents when tab or pagination changes
  const loadPaginatedDocuments = useCallback(async () => {
    if (activeTab === 'members' || activeTab === 'minutes') return;
    
    try {
      setLoading(true);
      const category = activeTab === 'documents' ? undefined : activeTab;
      
      if (usingDemoData) {
        // Simulate pagination with demo data
        const filtered = category 
          ? demoDocuments.filter(doc => doc.category === category)
          : demoDocuments;
        
        const start = (documentsPagination.currentPage - 1) * documentsPagination.pageSize;
        const end = start + documentsPagination.pageSize;
        const paginatedDocs = filtered.slice(start, end);
        
        setPaginatedDocuments({
          documents: paginatedDocs,
          total: filtered.length,
          hasMore: end < filtered.length
        });
        documentsPaginationActions.setTotalItems(filtered.length);
      } else {
        const result = await api.getLodgeDocumentsPaginated(
          documentsPagination.currentPage,
          documentsPagination.pageSize,
          category
        );
        setPaginatedDocuments(result);
        documentsPaginationActions.setTotalItems(result.total);
      }
    } catch (err) {
      console.error('Error loading paginated documents:', err);
      showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [activeTab, documentsPagination.currentPage, documentsPagination.pageSize, usingDemoData, documentsPaginationActions, showError]);

  // Load paginated documents when dependencies change
  useEffect(() => {
    if (dataLoaded) {
      loadPaginatedDocuments();
    }
  }, [loadPaginatedDocuments, dataLoaded]);

  // Memoize document counts with caching
  const documentCounts = useMemo(() => {
    const counts = {
      all: allDocuments.length,
      grand_lodge: 0,
      provincial: 0,
      summons: 0,
      lodge_instruction: 0,
      resources: 0,
      minutes: minutes.length,
      members: members.length,
      gpc_minutes: 0
    };
    
    // Only calculate category counts if we have documents
    if (allDocuments.length > 0) {
      allDocuments.forEach(doc => {
        if (doc.category in counts) {
          (counts as any)[doc.category]++;
        }
      });
    }
    
    return counts;
  }, [allDocuments.length, minutes.length, members.length]);

  // Handle navigation for non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/members', { replace: true });
    }
    
    // Redirect users who need password reset
    if (!authLoading && user && needsPasswordReset) {
      navigate('/password-reset', { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      showError('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Don't load if still authenticating or no user or already loaded
      if (authLoading || !user || dataLoaded) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to load real data first
        try {
          // Load all data in parallel
          const [minutesData, membersData] = await Promise.all([
            api.getMeetingMinutes(),
            api.getAllMembers()
          ]);

          setMinutes(minutesData);
          setMembers(membersData);
          
          // Load initial document counts for tabs (without full data)
          const documentCategoryCounts = await Promise.all([
            api.getLodgeDocuments().then(docs => ({ all: docs.length, docs })),
          ]);
          
          setAllDocuments(documentCategoryCounts[0].docs);
          setUsingDemoData(false);
          
        } catch (dbError) {
          console.warn('Database not connected, using demo data:', dbError);
          
          // Fall back to demo data
          setAllDocuments(demoDocuments);
          setMinutes(demoMinutes);
          setMembers(demoMembers);
          setUsingDemoData(true);
        }
        
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading admin data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        showError('Failed to load data');
        
        // Still show demo data even if there's an error
        setAllDocuments(demoDocuments);
        setMinutes(demoMinutes);
        setMembers(demoMembers);
        setUsingDemoData(true);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, dataLoaded, showError]);

  const handleDocumentSubmit = async (document: Omit<LodgeDocument, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        if (editingDocument) {
          // Simulate updating demo data
          const updatedDocs = allDocuments.map(doc => 
            doc.id === editingDocument.id 
              ? { ...doc, ...document, updated_at: new Date().toISOString() }
              : doc
          );
          setAllDocuments(updatedDocs);
          
          // Invalidate cache and reload paginated view
          api.invalidateCache.documents(document.category);
          loadPaginatedDocuments();
          
          success('Document updated successfully (demo mode)');
        } else {
          // Simulate adding to demo data
          const newDoc: LodgeDocument = {
            ...document,
            id: `demo-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setAllDocuments(prev => [newDoc, ...prev]);
          
          // Invalidate cache and reload paginated view
          api.invalidateCache.documents(document.category);
          loadPaginatedDocuments();
          success('Document added successfully (demo mode)');
        }
      } else {
        if (editingDocument) {
          // Update existing document
          // Note: This would need to be implemented in the API
          // await api.updateDocument(editingDocument.id, document);
          await api.updateDocument(editingDocument.id, document);
          success('Document updated successfully');
          // Invalidate cache and reload
          api.invalidateCache.documents(document.category);
          loadPaginatedDocuments();
        } else {
          // Create new document
          await api.createDocument(document);
          success('Document added successfully');
          // Invalidate cache and reload
          api.invalidateCache.documents(document.category);
          loadPaginatedDocuments();
        }
      }
      setShowDocumentForm(false);
      setEditingDocument(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError(editingDocument ? 'Failed to update document' : 'Failed to add document');
    }
  };

  const handleMinutesSubmit = async (minutes: Omit<MeetingMinutes, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (usingDemoData) {
        if (editingMinute) {
          // Simulate updating demo data
          const updatedMinutes = minutes.map(m => 
            m.id === editingMinute.id 
              ? { ...m, ...minutes, updated_at: new Date().toISOString() }
              : m
          );
          setMinutes(updatedMinutes);
          success('Meeting minutes updated successfully (demo mode)');
        } else {
          // Simulate adding to demo data
          const newMinutes: MeetingMinutes = {
            ...minutes,
            id: `demo-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setMinutes(prev => [newMinutes, ...prev]);
          success('Meeting minutes added successfully (demo mode)');
        }
      } else {
        if (editingMinute) {
          await api.updateMinutes(editingMinute.id, minutes);
          success('Meeting minutes updated successfully');
        } else {
          await api.createMinutes(minutes);
          success('Meeting minutes added successfully');
        }
        const updatedMinutes = await api.getMeetingMinutes();
        setMinutes(updatedMinutes);
      }
      setShowMinutesForm(false);
      setEditingMinute(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError(editingMinute ? 'Failed to update meeting minutes' : 'Failed to add meeting minutes');
    }
  };

  const handleMemberSubmit = async (data: {
    user_id: string;
    full_name: string;
    position?: string;
    role: 'member' | 'admin';
  }) => {
    try {
      if (usingDemoData) {
        // Simulate adding/updating demo data
        if (editingMember) {
          setMembers(prev => prev.map(m => 
            m.id === editingMember.id 
              ? { ...m, ...data, updated_at: new Date().toISOString() }
              : m
          ));
          success('Member profile updated successfully (demo mode)');
        } else {
          const newMember: MemberProfile = {
            ...data,
            id: `demo-${Date.now()}`,
            join_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setMembers(prev => [newMember, ...prev]);
          success('Member profile created successfully (demo mode)');
        }
      } else {
        if (editingMember) {
          await api.updateMemberProfile(editingMember.user_id, data);
          success('Member profile updated successfully');
        } else {
          await api.adminCreateMemberProfile(data);
          success('Member profile created successfully');
        }
        
        const updatedMembers = await api.getAllMembers();
        setMembers(updatedMembers);
      }
      
      setShowMemberForm(false);
      setEditingMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError(editingMember ? 'Failed to update member profile' : 'Failed to create member profile');
    }
  };

  const handleEditDocument = (document: LodgeDocument) => {
    setEditingDocument(document);
    setShowDocumentForm(true);
  };

  const handleCancelEditDocument = () => {
    setEditingDocument(null);
    setShowDocumentForm(false);
  };

  const handleDeleteDocument = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            // Simulate deletion in demo mode
            const updatedDocs = allDocuments.filter(doc => doc.id !== id);
            setAllDocuments(updatedDocs);
            loadPaginatedDocuments();
            success('Document deleted successfully (demo mode)');
          } else {
            // Delete document via API
            // await api.deleteDocument(id);
            await api.deleteDocument(id);
            api.invalidateCache.documents();
            loadPaginatedDocuments();
            success('Document deleted successfully');
          }
        } catch (err) {
          console.error('Delete error:', err);
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(`Failed to delete document: ${errorMessage}`);
          showError(`Failed to delete document: ${errorMessage}`);
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleEditMember = (member: MemberProfile) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setShowMemberForm(false);
  };

  const handleEditMinute = (minute: MeetingMinutes) => {
    setEditingMinute(minute);
    setShowMinutesForm(true);
  };

  const handleCancelEditMinute = () => {
    setEditingMinute(null);
    setShowMinutesForm(false);
  };

  const handleDeleteMinute = async (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Meeting Minutes',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          if (usingDemoData) {
            // Simulate deletion in demo mode
            setMinutes(prev => prev.filter(m => m.id !== id));
            success('Meeting minutes deleted successfully (demo mode)');
          } else {
            await api.deleteMinutes(id);
            const updatedMinutes = await api.getMeetingMinutes();
            setMinutes(updatedMinutes);
            success('Meeting minutes deleted successfully');
          }
        } catch (err) {
          console.error('Delete error:', err);
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(`Failed to delete meeting minutes: ${errorMessage}`);
          showError(`Failed to delete meeting minutes: ${errorMessage}`);
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleDeleteMember = async (userId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Member',
      message: `Are you sure you want to permanently delete "${memberName}" and their profile? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setError(null);
          setDeletingUserId(userId);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          
          if (usingDemoData) {
            // Simulate deletion in demo mode
            setMembers(prev => prev.filter(m => m.user_id !== userId));
            success('Member deleted successfully (demo mode)');
          } else {
            await api.deleteUserAndProfile(userId);
            const updatedMembers = await api.getAllMembers();
            setMembers(updatedMembers);
            success('Member deleted successfully');
          }
        } catch (err) {
          console.error('Delete error:', err);
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(`Failed to delete user: ${errorMessage}`);
          showError(`Failed to delete member: ${errorMessage}`);
        } finally {
          setDeletingUserId(null);
        }
      }
    });
  };

  // Document row renderer for virtualized list
  const DocumentRow = ({ index, style, data }: { index: number; style: React.CSSProperties; data: LodgeDocument[] }) => {
    const doc = data[index];
    
    return (
      <div style={style} className="px-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center justify-between hover:shadow-soft transition-shadow">
          <div className="flex-grow">
            <h3 className="font-medium text-primary-600">{doc.title}</h3>
            {doc.description && (
              <p className="text-sm text-neutral-600 mt-1">{doc.description}</p>
            )}
            <div className="flex items-center mt-2">
              <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                {doc.category.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-neutral-500 ml-4">
                Added {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-500 hover:text-primary-600 transition-colors"
              title="Open document"
            >
              <ExternalLink size={18} />
            </a>
            <button 
              className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
              title="Edit document"
              onClick={() => handleEditDocument(doc)}
            >
              <Pencil size={18} />
            </button>
            <button 
              className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
              title="Delete document"
              onClick={() => handleDeleteDocument(doc.id)}
            >
              <Trash2 size={18} />
            </button>
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
              Admin Dashboard
            </h1>
            <p className="text-neutral-600">
              Manage Lodge documents, meeting minutes, and member profiles
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
              <AlertTriangle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h3 className="font-medium text-blue-800 mb-1">Demo Mode</h3>
                <p className="text-blue-700">
                  Database not connected - showing demo data to demonstrate the Admin Dashboard functionality.
                  In production, this would show real lodge data and allow full management capabilities.
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

        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={activeTab === 'members' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('members')}
            className="flex items-center"
          >
            <Users size={18} className="mr-2" />
            Members ({documentCounts.members})
          </Button>
          <Button
            variant={activeTab === 'documents' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('documents')}
            className="flex items-center"
          >
            <FileText size={18} className="mr-2" />
            All Documents ({documentCounts.all})
          </Button>
          <Button
            variant={activeTab === 'grand_lodge' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('grand_lodge')}
            className="flex items-center"
          >
            <Landmark size={18} className="mr-2" />
            Grand Lodge ({documentCounts.grand_lodge})
          </Button>
          <Button
            variant={activeTab === 'provincial' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('provincial')}
            className="flex items-center"
          >
            <Building2 size={18} className="mr-2" />
            Provincial ({documentCounts.provincial})
          </Button>
          <Button
            variant={activeTab === 'summons' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('summons')}
            className="flex items-center"
          >
            <ScrollText size={18} className="mr-2" />
            Summons ({documentCounts.summons})
          </Button>
          <Button
            variant={activeTab === 'lodge_instruction' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('lodge_instruction')}
            className="flex items-center"
          >
            <BookOpen size={18} className="mr-2" />
            Lodge of Instruction ({documentCounts.lodge_instruction})
          </Button>
          <Button
            variant={activeTab === 'resources' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('resources')}
            className="flex items-center"
          >
            <Archive size={18} className="mr-2" />
            Resources ({documentCounts.resources})
          </Button>
          <Button
            variant={activeTab === 'minutes' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('minutes')}
            className="flex items-center"
          >
            <Clock size={18} className="mr-2" />
            Minutes ({documentCounts.minutes})
          </Button>
          <Button
            variant={activeTab === 'gpc_minutes' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('gpc_minutes')}
            className="flex items-center"
          >
            <Clock size={18} className="mr-2" />
            GPC Minutes ({documentCounts.gpc_minutes})
          </Button>
        </div>

        {activeTab === 'members' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Member Profiles ({members.length})
              </h2>
              <Button
                onClick={() => setShowMemberForm(true)}
                className="flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Member
              </Button>
            </div>

            {showMemberForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingMember ? 'Edit Member Profile' : 'Add New Member Profile'}
                </h3>
                <MemberProfileAdminForm
                  onSubmit={handleMemberSubmit}
                  onCancel={handleCancelEdit}
                  initialData={editingMember || undefined}
                />
              </div>
            )}

            {loading ? (
              <LoadingSpinner subtle={true} className="py-8" />
            ) : members.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <p className="text-neutral-600">No member profiles found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center justify-between hover:shadow-soft transition-shadow"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-primary-600">{member.full_name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          member.role === 'admin'
                            ? 'bg-secondary-100 text-secondary-700'
                            : member.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : member.status === 'inactive'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                        }`}>
                          {member.role} {member.status && `(${member.status})`}
                        </span>
                      </div>
                      {member.position && (
                        <p className="text-sm text-neutral-600 mt-1">{member.position}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-neutral-500">
                        <span>User ID: {member.user_id}</span>
                        <span className="mx-2">•</span>
                        <span>Registered {new Date(member.registration_date || member.created_at).toLocaleDateString('en-GB')}</span>
                        {member.last_login && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Last login {new Date(member.last_login).toLocaleDateString('en-GB')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                        onClick={() => handleEditMember(member)}
                        title="Edit member"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className={`p-2 transition-colors ${
                          deletingUserId === member.user_id
                            ? 'text-neutral-400 cursor-not-allowed'
                            : 'text-neutral-500 hover:text-red-500'
                        }`}
                        onClick={() => handleDeleteMember(member.user_id, member.full_name)}
                        disabled={deletingUserId === member.user_id}
                        title="Delete member"
                      >
                        {deletingUserId === member.user_id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab !== 'minutes' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                {activeTab === 'documents' && `All Documents (${filteredDocuments.length})`}
                {activeTab === 'grand_lodge' && `Grand Lodge Communications (${filteredDocuments.length})`}
                {activeTab === 'provincial' && `Provincial Communications (${filteredDocuments.length})`}
                {activeTab === 'summons' && `Summons (${filteredDocuments.length})`}
                {activeTab === 'lodge_instruction' && `Lodge of Instruction Minutes (${filteredDocuments.length})`}
                {activeTab === 'resources' && `Resources (${filteredDocuments.length})`}
                {activeTab === 'gpc_minutes' && `GPC Minutes (${filteredDocuments.length})`}
              </h2>
              <Button
                onClick={() => setShowDocumentForm(true)}
                className="flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Document
              </Button>
            </div>

            {showDocumentForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingDocument ? 'Edit Document' : 'Add New Document'}
                </h3>
                <DocumentForm
                  onSubmit={handleDocumentSubmit}
                  onCancel={handleCancelEditDocument}
                  initialData={editingDocument || undefined}
                />
              </div>
            )}

            {loading ? (
              <LoadingSpinner subtle={true} className="py-8" />
            ) : paginatedDocuments.documents.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <p className="text-neutral-600">
                  {activeTab === 'documents' 
                    ? 'No documents found.' 
                    : `No ${activeTab.replace('_', ' ')} documents found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Virtualized list for better performance with large datasets */}
                <VirtualizedList
                  items={paginatedDocuments.documents}
                  height={600}
                  itemHeight={120}
                  renderItem={DocumentRow}
                  className="border border-neutral-200 rounded-lg"
                />
                
                {/* Pagination controls */}
                <PaginationControls
                  currentPage={documentsPagination.currentPage}
                  totalPages={documentsPagination.totalPages}
                  pageSize={documentsPagination.pageSize}
                  totalItems={paginatedDocuments.total}
                  onPageChange={documentsPaginationActions.setPage}
                  onPageSizeChange={documentsPaginationActions.setPageSize}
                  canGoNext={documentsPaginationActions.canGoNext}
                  canGoPrev={documentsPaginationActions.canGoPrev}
                  onFirstPage={documentsPaginationActions.goToFirstPage}
                  onLastPage={documentsPaginationActions.goToLastPage}
                  onNextPage={documentsPaginationActions.nextPage}
                  onPrevPage={documentsPaginationActions.prevPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary-600">
                Meeting Minutes ({minutes.length})
              </h2>
              <Button
                onClick={() => setShowMinutesForm(true)}
                className="flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Minutes
              </Button>
            </div>

            {showMinutesForm && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">
                  {editingMinute ? 'Edit Meeting Minutes' : 'Add New Meeting Minutes'}
                </h3>
                <MinutesForm
                  onSubmit={handleMinutesSubmit}
                  onCancel={handleCancelEditMinute}
                  initialData={editingMinute || undefined}
                />
              </div>
            )}

            {loading ? (
              <LoadingSpinner subtle={true} className="py-8" />
            ) : minutes.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <p className="text-neutral-600">No meeting minutes found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {minutes.map((minute) => (
                  <div
                    key={minute.id}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-primary-600">{minute.title}</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                          {new Date(minute.meeting_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {minute.document_url && (
                          <a
                            href={minute.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-neutral-500 hover:text-primary-600 transition-colors"
                            title="Open document"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button 
                          className="p-2 text-neutral-500 hover:text-secondary-500 transition-colors"
                          onClick={() => handleEditMinute(minute)}
                          title="Edit minutes"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteMinute(minute.id, minute.title)}
                          title="Delete minutes"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-neutral-600 whitespace-pre-wrap">
                      {minute.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
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

export default AdminPage;