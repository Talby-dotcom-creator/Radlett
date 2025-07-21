import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CMSOfficer } from '../../types';
import Button from '../Button';
import MediaManager from './MediaManager';
import { Image, X } from 'lucide-react';

interface OfficerFormProps {
  onSubmit: (data: Omit<CMSOfficer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CMSOfficer>;
}

const OfficerForm: React.FC<OfficerFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(initialData?.image_url || '');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      position: initialData?.position || '',
      full_name: initialData?.full_name || '',
      image_url: initialData?.image_url || '',
      sort_order: initialData?.sort_order || 0,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true
    }
  });

  const watchedImageUrl = watch('image_url');

  const handleMediaSelect = (url: string) => {
    setSelectedImageUrl(url);
    setValue('image_url', url, { shouldDirty: true });
    setShowMediaManager(false);
  };

  const handleClearImage = () => {
    setSelectedImageUrl('');
    setValue('image_url', '', { shouldDirty: true });
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      image_url: selectedImageUrl || data.image_url
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-primary-600">
            Position
          </label>
          <input
            id="position"
            {...register('position', { required: 'Position is required' })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
            placeholder="e.g., Worshipful Master, Senior Warden"
          />
          {errors.position && (
            <p className="mt-1 text-sm text-red-600">{errors.position.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-primary-600">
            Full Name
          </label>
          <input
            id="full_name"
            {...register('full_name', { required: 'Full name is required' })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-primary-600">
            Officer Photo
          </label>
          <div className="mt-1 space-y-3">
            {/* Image URL Input with Media Manager Button */}
            <div className="flex space-x-2">
              <input
                id="image_url"
                type="url"
                {...register('image_url')}
                value={selectedImageUrl}
                onChange={(e) => {
                  setSelectedImageUrl(e.target.value);
                  setValue('image_url', e.target.value, { shouldDirty: true });
                }}
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                placeholder="https://example.com/photo.jpg or use Media Manager"
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
              {selectedImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearImage}
                  className="flex items-center px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <X size={16} />
                </Button>
              )}
            </div>

            {/* Image Preview */}
            {selectedImageUrl && (
              <div className="mt-3">
                <p className="text-sm font-medium text-neutral-700 mb-2">Preview:</p>
                <div className="relative inline-block">
                  <img
                    src={selectedImageUrl}
                    alt="Officer preview"
                    className="w-24 h-24 object-cover rounded-lg border border-neutral-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-500">
              You can paste an image URL directly or use the Media Manager to upload/select images.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-primary-600">
            Sort Order
          </label>
          <input
            id="sort_order"
            type="number"
            {...register('sort_order', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Lower numbers appear first. Use 1, 2, 3, etc. to control the display order.
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            {...register('is_active')}
            className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-neutral-700">
            Active Officer (visible on website)
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Officer'}
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

export default OfficerForm;