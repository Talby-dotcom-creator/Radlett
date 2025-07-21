import React from 'react';
import { Calendar, Clock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../Button';

interface ScheduleData {
  publish_date: string;
  publish_time: string;
  unpublish_date?: string;
  unpublish_time?: string;
  auto_publish: boolean;
  auto_unpublish: boolean;
}

interface ContentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: ScheduleData) => Promise<void>;
  initialData?: Partial<ScheduleData>;
  contentTitle: string;
}

const ContentScheduler: React.FC<ContentSchedulerProps> = ({
  isOpen,
  onClose,
  onSchedule,
  initialData,
  contentTitle
}) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ScheduleData>({
    defaultValues: {
      publish_date: initialData?.publish_date || new Date().toISOString().split('T')[0],
      publish_time: initialData?.publish_time || '09:00',
      unpublish_date: initialData?.unpublish_date || '',
      unpublish_time: initialData?.unpublish_time || '17:00',
      auto_publish: initialData?.auto_publish || false,
      auto_unpublish: initialData?.auto_unpublish || false
    }
  });

  const autoPublish = watch('auto_publish');
  const autoUnpublish = watch('auto_unpublish');

  if (!isOpen) return null;

  const onSubmit = async (data: ScheduleData) => {
    await onSchedule(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-secondary-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-primary-600">Schedule Content</h2>
              <p className="text-sm text-neutral-600">{contentTitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Auto Publish */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="auto_publish"
                  type="checkbox"
                  {...register('auto_publish')}
                  className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                />
                <label htmlFor="auto_publish" className="ml-2 flex items-center text-sm text-neutral-700">
                  <Eye size={16} className="mr-1" />
                  Auto-publish content
                </label>
              </div>

              {autoPublish && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="publish_date" className="block text-sm font-medium text-primary-600">
                      Publish Date
                    </label>
                    <input
                      id="publish_date"
                      type="date"
                      {...register('publish_date', { 
                        required: autoPublish ? 'Publish date is required' : false 
                      })}
                      className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                    />
                    {errors.publish_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.publish_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="publish_time" className="block text-sm font-medium text-primary-600">
                      Publish Time
                    </label>
                    <input
                      id="publish_time"
                      type="time"
                      {...register('publish_time', { 
                        required: autoPublish ? 'Publish time is required' : false 
                      })}
                      className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                    />
                    {errors.publish_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.publish_time.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auto Unpublish */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="auto_unpublish"
                  type="checkbox"
                  {...register('auto_unpublish')}
                  className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                />
                <label htmlFor="auto_unpublish" className="ml-2 flex items-center text-sm text-neutral-700">
                  <EyeOff size={16} className="mr-1" />
                  Auto-unpublish content
                </label>
              </div>

              {autoUnpublish && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="unpublish_date" className="block text-sm font-medium text-primary-600">
                      Unpublish Date
                    </label>
                    <input
                      id="unpublish_date"
                      type="date"
                      {...register('unpublish_date', { 
                        required: autoUnpublish ? 'Unpublish date is required' : false 
                      })}
                      className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                    />
                    {errors.unpublish_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.unpublish_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="unpublish_time" className="block text-sm font-medium text-primary-600">
                      Unpublish Time
                    </label>
                    <input
                      id="unpublish_time"
                      type="time"
                      {...register('unpublish_time', { 
                        required: autoUnpublish ? 'Unpublish time is required' : false 
                      })}
                      className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                    />
                    {errors.unpublish_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.unpublish_time.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Scheduling Information</p>
                  <p>Content will be automatically published/unpublished at the specified times. You can modify or cancel the schedule at any time before it executes.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule Content'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentScheduler;