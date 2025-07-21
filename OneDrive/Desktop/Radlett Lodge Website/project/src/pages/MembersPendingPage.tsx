import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cmsApi } from '../lib/cmsApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, AlertTriangle, Mail, Phone } from 'lucide-react';

const MembersPendingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all page content for the members page
        const content = await cmsApi.getPageContent('members');
        
        // Convert to a key-value map for easier access
        const contentMap: Record<string, string> = {};
        content.forEach(item => {
          contentMap[item.section_name] = item.content;
        });
        
        setPageContent(contentMap);
      } catch (err) {
        console.error('Error loading members page content:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    loadPageContent();
  }, []);

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is active, redirect to members area
  if (profile?.status === 'active') {
    return <Navigate to="/members" replace />;
  }

  // Get content from CMS or use defaults
  const pendingTitle = pageContent.pending_title || 'Your Membership is Pending';
  const pendingText = pageContent.pending_text || '<p>Thank you for registering. Your membership is currently pending verification by an administrator.</p><p>Once approved, you will have full access to all member resources. This typically takes 1-2 business days.</p><p>If you have any questions, please contact the Lodge Secretary.</p>';

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <LoadingSpinner subtle={true} className="py-8" />
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-primary-600 mb-4">
                  {pendingTitle}
                </h1>
                <div 
                  className="prose max-w-none text-neutral-600"
                  dangerouslySetInnerHTML={{ __html: pendingText }}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h3 className="font-medium text-blue-800 mb-1">What happens next?</h3>
                    <p className="text-blue-700">
                      An administrator will review your registration and approve your membership.
                      You'll receive an email notification when your account is activated.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-xl font-heading font-semibold text-primary-600 mb-4">
                  Contact Information
                </h2>
                <p className="text-neutral-600 mb-6">
                  If you need immediate assistance or have questions about your membership status, please contact:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-secondary-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-primary-600">Email</h3>
                      <a href="mailto:mattjohnson56@hotmail.co.uk" className="text-secondary-500 hover:text-secondary-600 transition-colors">
                        mattjohnson56@hotmail.co.uk
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-secondary-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-primary-600">Phone</h3>
                      <a href="tel:07590800657" className="text-secondary-500 hover:text-secondary-600 transition-colors">
                        07590 800657
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersPendingPage;