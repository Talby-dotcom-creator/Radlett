import React from 'react';
import { FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { LodgeDocument } from '../../types';
import DashboardCard from '../DashboardCard';
import Button from '../Button';

interface RecentDocumentsCardProps {
  documents: LodgeDocument[];
  onViewAllDocuments: () => void;
}

const RecentDocumentsCard: React.FC<RecentDocumentsCardProps> = ({ documents, onViewAllDocuments }) => {
  const recentDocuments = documents
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <DashboardCard 
      title="Recent Documents" 
      icon={FileText}
      headerAction={
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllDocuments}
          className="flex items-center text-xs"
        >
          Browse All
          <ArrowRight size={14} className="ml-1" />
        </Button>
      }
    >
      {recentDocuments.length > 0 ? (
        <div className="space-y-3">
          {recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <h4 className="font-medium text-primary-600 text-sm line-clamp-1">{doc.title}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                      {doc.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">
                      {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-1 text-neutral-500 hover:text-primary-600 transition-colors flex-shrink-0"
                  title="Open document"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
          <p className="text-neutral-500 text-sm">No recent documents available</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default RecentDocumentsCard;