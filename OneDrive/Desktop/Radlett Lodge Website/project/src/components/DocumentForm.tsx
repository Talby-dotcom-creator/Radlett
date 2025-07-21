import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LodgeDocument } from '../types';
import Button from './Button';
import MediaManager from './cms/MediaManager';
import { Image, X } from 'lucide-react';

interface DocumentFormProps {
  onSubmit: (data: Omit<LodgeDocument, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<LodgeDocument>;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState(initialData?.url || '');
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      url: initialData?.url || '',
      category: initialData?.category || ''
    }
  });

  const handleMediaSelect = (url: string) => {
    setSelectedDocumentUrl(url);
    setValue('url', url, { shouldDirty: true });
    setShowMediaManager(false);
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      url: selectedDocumentUrl || data.url
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-primary-600">
          Document Title
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
        <label htmlFor="description" className="block text-sm font-medium text-primary-600">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-primary-600 mb-2">
          Document URL / File
        </label>
        <div className="flex space-x-2">
          <input
            id="url"
            type="url"
            {...register('url', { required: 'URL is required' })}
            value={selectedDocumentUrl}
            onChange={(e) => {
              setSelectedDocumentUrl(e.target.value);
              setValue('url', e.target.value, { shouldDirty: true });
            }}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
            placeholder="https://example.com/document.pdf or use Media Manager"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMediaManager(true)}
            className="flex items-center px-3"
          >
            <Image size={16} className="mr-1" />
            Browse
          </Button>
          {selectedDocumentUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedDocumentUrl('');
                setValue('url', '', { shouldDirty: true });
              }}
              className="flex items-center px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <X size={16} />
            </Button>
          )}
        </div>
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url.message as string}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          You can paste a URL directly or use the Media Manager to upload/select files.
        </p>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-primary-600">
          Category
        </label>
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        >
          <option value="">Select a category</option>
          <option value="grand_lodge">Grand Lodge Communications</option>
          <option value="provincial">Hertfordshire Provincial Communications</option>
          <option value="summons">Summons</option>
          <option value="lodge_instruction">Lodge of Instruction</option>
          <option value="gpc_minutes">GPC Minutes</option>
          <option value="resources">Resources</option>
          <option value="ritual">Ritual</option>
          <option value="bylaws">Bylaws</option>
          <option value="forms">Forms</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message as string}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Document' : 'Save Document'}
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

export default DocumentForm;