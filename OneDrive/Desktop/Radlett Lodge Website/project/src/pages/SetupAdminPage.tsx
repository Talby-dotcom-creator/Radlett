import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setupAdminProfile } from '../utils/setupAdmin';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const SetupAdminPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login\" replace />;
  }

  // Redirect if already admin
  if (profile?.role === 'admin') {
    return <Navigate to="/members" replace />;
  }

  const handleSetupAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await setupAdminProfile();
      await refreshProfile();
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        window.location.href = '/members';
      }, 2000);
      
    } catch (err) {
      console.error('Setup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup admin profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-heading font-bold text-primary-600 mb-8">
            Setup Admin Profile
          </h1>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Admin Profile Created!
              </h2>
              <p className="text-green-600 mb-4">
                Your admin profile has been successfully created. Redirecting to members area...
              </p>
              <LoadingSpinner size="sm" className="mx-auto" />
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-6 shadow-medium">
              <p className="text-neutral-600 mb-6">
                You're logged in as <strong>{user.email}</strong> but don't have an admin profile yet. 
                Click the button below to create your admin profile.
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                  <AlertTriangle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-red-700">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleSetupAdmin}
                disabled={loading}
                fullWidth
                className="flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm\" className="mr-2" />
                    Creating Admin Profile...
                  </>
                ) : (
                  'Create Admin Profile'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupAdminPage;