import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { MemberProfile } from '../types';
import SectionHeading from '../components/SectionHeading';
import { Search } from 'lucide-react';

const DirectoryPage: React.FC = () => {
  const { user, needsPasswordReset } = useAuth();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await api.getAllMembers();
        setMembers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  if (!user) {
    return <Navigate to="/login\" replace />;
  }
  
  // Redirect to password reset if needed
  if (needsPasswordReset) {
    return <Navigate to="/password-reset" replace />;
  }

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          title="Member Directory"
          subtitle="Connect with your fellow Lodge members"
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          </div>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(member => (
                <div key={member.id} className="bg-white rounded-lg p-6 shadow-soft">
                  <h3 className="font-heading font-semibold text-primary-600">
                    {member.full_name}
                  </h3>
                  {member.position && (
                    <p className="text-neutral-600 mt-1">{member.position}</p>
                  )}
                  <p className="text-sm text-neutral-500 mt-2">
                    Member since {new Date(member.join_date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryPage;