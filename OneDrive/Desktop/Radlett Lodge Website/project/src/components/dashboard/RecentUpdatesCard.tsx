import React from 'react';
import { Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { MeetingMinutes } from '../../types';
import DashboardCard from '../DashboardCard';
import Button from '../Button';

interface RecentUpdatesCardProps {
  minutes: MeetingMinutes[];
  onViewAllMinutes: () => void;
}

const RecentUpdatesCard: React.FC<RecentUpdatesCardProps> = ({ minutes, onViewAllMinutes }) => {
  const recentMinutes = minutes
    .sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime())
    .slice(0, 2);

  return (
    <DashboardCard 
      title="Recent Updates" 
      icon={Clock}
      headerAction={
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllMinutes}
          className="flex items-center text-xs"
        >
          View All
          <ArrowRight size={14} className="ml-1" />
        </Button>
      }
    >
      {recentMinutes.length > 0 ? (
        <div className="space-y-3">
          {recentMinutes.map((minute) => (
            <div
              key={minute.id}
              className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <h4 className="font-medium text-primary-600 text-sm">{minute.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(minute.meeting_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
                {minute.document_url && (
                  <a
                    href={minute.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-1 text-neutral-500 hover:text-primary-600 transition-colors flex-shrink-0"
                    title="View document"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
          <p className="text-neutral-500 text-sm">No recent minutes available</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default RecentUpdatesCard;