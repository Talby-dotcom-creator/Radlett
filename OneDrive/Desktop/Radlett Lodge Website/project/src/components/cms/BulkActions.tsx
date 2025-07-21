import React from 'react';
import { Trash2, Eye, EyeOff, Archive, MoreHorizontal } from 'lucide-react';
import Button from '../Button';

interface BulkActionsProps {
  selectedItems: string[];
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
  onBulkArchive?: () => void;
  contentType: string;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  onClearSelection,
  onBulkDelete,
  onBulkPublish,
  onBulkUnpublish,
  onBulkArchive,
  contentType
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-primary-700">
            {selectedItems.length} {contentType}{selectedItems.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-primary-600 hover:text-primary-800 underline"
          >
            Clear selection
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkPublish}
            className="flex items-center"
          >
            <Eye size={16} className="mr-1" />
            Publish
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkUnpublish}
            className="flex items-center"
          >
            <EyeOff size={16} className="mr-1" />
            Unpublish
          </Button>
          
          {onBulkArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkArchive}
              className="flex items-center"
            >
              <Archive size={16} className="mr-1" />
              Archive
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            className="flex items-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;