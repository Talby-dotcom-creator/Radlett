import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { MemberProfile } from '../types';
import ProfileForm from '../components/ProfileForm';
import SectionHeading from '../components/SectionHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Shield, Calendar, Award, AlertTriangle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, profile: authProfile, refreshProfile, needsPasswordReset } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setError(null);
        
        // Try to get profile from auth context first
        if (authProfile) {
          setProfile(authProfile);
          setLoading(false);
          return;
        }
        
        // Fallback to API call
        const data = await api.getMemberProfile(user.id);
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        
        // Create a basic profile from user data if none exists
        if (user) {
          setProfile({
            id: 'temp-profile',
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'Member',
            position: undefined,
            role: 'member',
            join_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authProfile]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to password reset if needed
  if (needsPasswordReset) {
    return <Navigate to="/password-reset" replace />;
  }

  const handleUpdateProfile = async (data: Partial<MemberProfile>) => {
    if (!user || !profile) return;
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      const updated = await api.updateMemberProfile(user.id, data);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
      
      // Refresh the auth context profile
      await refreshProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-8 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center pt-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          title="Profile Settings"
          subtitle="Manage your member profile information and Lodge details"
        />

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h3 className="font-medium text-red-800 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h3 className="font-medium text-green-800 mb-1">Success</h3>
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-primary-600">
                  {profile?.full_name || 'Member'}
                </h3>
                {profile?.position && (
                  <p className="text-neutral-600 mt-1">{profile.position}</p>
                )}
                <span className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${
                  profile?.role === 'admin' 
                    ? 'bg-secondary-100 text-secondary-700 border border-secondary-200' 
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}>
                  {profile?.role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">Member Since</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">
                    {profile?.join_date ? new Date(profile.join_date).getFullYear() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">Status</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">Lodge Number</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">6652</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">User ID</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">
                    {user.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-800 mb-2">Profile Information</h4>
              <p className="text-sm text-blue-700">
                Your profile information is visible to other Lodge members. The position field 
                should reflect your current Masonic rank or office within the Lodge.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <h3 className="text-xl font-heading font-semibold text-primary-600 mb-6">
                Edit Profile Information
              </h3>
              
              {profile && (
                <ProfileForm 
                  profile={profile} 
                  onSubmit={handleUpdateProfile}
                  isUpdating={updating}
                />
              )}
            </div>

            {/* Masonic Positions Reference */}
            <div className="bg-white rounded-lg p-6 shadow-soft mt-6">
              <h4 className="text-lg font-heading font-semibold text-primary-600 mb-4">
                Masonic Positions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-neutral-700 mb-2">Principal Officers</h5>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• Worshipful Master</li>
                    <li>• Senior Warden</li>
                    <li>• Junior Warden</li>
                    <li>• Treasurer</li>
                    <li>• Secretary</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-neutral-700 mb-2">Other Officers</h5>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• Senior Deacon</li>
                    <li>• Junior Deacon</li>
                    <li>• Chaplain</li>
                    <li>• Director of Ceremonies</li>
                    <li>• Charity Steward</li>
                    <li>• Almoner</li>
                    <li>• Asst Almoner</li>
                    <li>• Inner Guard</li>
                    <li>• Asst Director of ceremonies</li>
                    <li>• Steward</li>
                    <li>• Mentor</li>
                    <li>• IPM</li>
                    <li>• Membership officer</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-4">
                If you hold a position not listed here, please enter it as appropriate. 
                Members may hold multiple offices simultaneously. Leave blank if you don't currently hold a specific office.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;