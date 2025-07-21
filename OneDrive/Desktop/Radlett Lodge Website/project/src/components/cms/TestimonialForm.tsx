import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CMSTestimonial } from '../../types';
import Button from '../Button';
import MediaManager from './MediaManager';
import { Image, X } from 'lucide-react';

interface TestimonialFormProps {
  onSubmit: (data: Omit<CMSTestimonial, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CMSTestimonial>;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(initialData?.image_url || '');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      member_name: initialData?.member_name || '',
      content: initialData?.content || '',
      image_url: initialData?.image_url || '',
      sort_order: initialData?.sort_order || 0,
      is_published: initialData?.is_published !== undefined ? initialData.is_published : true
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
        <label htmlFor="member_name" className="block text-sm font-medium text-primary-600">
          Member Name
        </label>
        <input
          id="member_name"
          {...register('member_name', { required: 'Member name is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.member_name && (
          <p className="mt-1 text-sm text-red-600">{errors.member_name.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-primary-600">
          Testimonial Content
        </label>
        <textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-primary-600">
          Member Photo
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
                  alt="Member preview"
                  className="w-24 h-24 object-cover rounded-full border border-neutral-200"
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
      </div>

      <div className="flex items-center">
        <input
          id="is_published"
          type="checkbox"
          {...register('is_published')}
          className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
        />
        <label htmlFor="is_published" className="ml-2 block text-sm text-neutral-700">
          Published
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Testimonial'}
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

export default TestimonialForm;