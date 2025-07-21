import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MeetingMinutes } from '../types';
import Button from './Button';
import MediaManager from './cms/MediaManager';
import { FileText, X } from 'lucide-react';

interface MinutesFormProps {
  onSubmit: (data: Omit<MeetingMinutes, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<MeetingMinutes>;
}

const MinutesForm: React.FC<MinutesFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState(initialData?.document_url || '');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      meeting_date: initialData?.meeting_date || '',
      content: initialData?.content || '',
      document_url: initialData?.document_url || ''
    }
  });

  const handleMediaSelect = (url: string) => {
    setSelectedDocumentUrl(url);
    setValue('document_url', url, { shouldDirty: true });
    setShowMediaManager(false);
  };

  const handleClearDocument = () => {
    setSelectedDocumentUrl('');
    setValue('document_url', '', { shouldDirty: true });
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      document_url: selectedDocumentUrl || data.document_url
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-primary-600">
          Meeting Title
        </label>
        <input
          id="title"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="meeting_date" className="block text-sm font-medium text-primary-600">
          Meeting Date
        </label>
        <input
          id="meeting_date"
          type="date"
          {...register('meeting_date', { required: 'Meeting date is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.meeting_date && (
          <p className="mt-1 text-sm text-red-600">{errors.meeting_date.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="document_url" className="block text-sm font-medium text-primary-600 mb-2">
          Meeting Minutes Document (PDF)
        </label>
        <div className="mt-1 space-y-3">
          {/* Document URL Input with Media Manager Button */}
          <div className="flex space-x-2">
            <input
              id="document_url"
              type="url"
              {...register('document_url')}
              value={selectedDocumentUrl}
              onChange={(e) => {
                setSelectedDocumentUrl(e.target.value);
                setValue('document_url', e.target.value, { shouldDirty: true });
              }}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
              placeholder="https://example.com/minutes.pdf or use Media Manager to upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaManager(true)}
              className="flex items-center px-3"
            >
              <FileText size={16} className="mr-1" />
              Upload PDF
            </Button>
            {selectedDocumentUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearDocument}
                className="flex items-center px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {/* Document Preview */}
          {selectedDocumentUrl && (
            <div className="mt-3">
              <p className="text-sm font-medium text-neutral-700 mb-2">Selected Document:</p>
              <div className="flex items-center p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-700">
                    {selectedDocumentUrl.split('/').pop() || 'Meeting Minutes Document'}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {selectedDocumentUrl}
                  </p>
                </div>
                <a
                  href={selectedDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Preview
                </a>
                <button
                  type="button"
                  onClick={handleClearDocument}
                  className="ml-2 p-1 text-red-500 hover:text-red-700"
                  title="Remove document"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-500">
            You can paste a PDF URL directly or use the Media Manager to upload PDF files. 
            The uploaded document will be accessible to all Lodge members.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-primary-600">
          Minutes Content
        </label>
        <textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          rows={10}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message as string}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Minutes' : 'Save Minutes'}
        </Button>
      </div>
    </form>

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelectMedia={handleMediaSelect}
      />
    </>
  );
};

export default MinutesForm;