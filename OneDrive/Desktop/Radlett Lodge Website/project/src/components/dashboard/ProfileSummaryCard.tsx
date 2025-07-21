import React from 'react';
import { UserCheck, Shield, Calendar } from 'lucide-react';
import { MemberProfile } from '../../types';
import DashboardCard from '../DashboardCard';

interface ProfileSummaryCardProps {
  profile: MemberProfile | null;
  userEmail?: string;
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ profile, userEmail }) => {
  return (
    <DashboardCard title="Welcome" icon={UserCheck}>
      <div className="space-y-3">
        <div className="flex items-center">
          <UserCheck className="w-4 h-4 text-secondary-500 mr-2 flex-shrink-0" />
          <span className="font-medium text-neutral-700">
            {profile?.full_name || userEmail || 'Member'}
          </span>
        </div>
        
        {profile?.position && (
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-secondary-500 mr-2 flex-shrink-0" />
            <span className="text-neutral-600 text-sm">{profile.position}</span>
          </div>
        )}
        
        {profile?.join_date && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-secondary-500 mr-2 flex-shrink-0" />
            <span className="text-neutral-600 text-sm">
              Member since {new Date(profile.join_date).getFullYear()}
            </span>
          </div>
        )}
        
        {profile?.role && (
          <div className="mt-3">
            <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
              profile.role === 'admin' 
                ? 'bg-secondary-100 text-secondary-700 border border-secondary-200' 
                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}>
              {profile.role === 'admin' ? 'Administrator' : 'Member'}
              {profile.status && profile.status !== 'active' && (
                <span className="ml-1">({profile.status})</span>
              )}
            </span>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default ProfileSummaryCard;