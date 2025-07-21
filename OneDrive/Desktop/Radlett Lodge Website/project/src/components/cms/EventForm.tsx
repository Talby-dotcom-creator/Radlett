import React from 'react';
import { useForm } from 'react-hook-form';
import { CMSEvent } from '../../types';
import Button from '../Button';

interface EventFormProps {
  onSubmit: (data: Omit<CMSEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CMSEvent>;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      event_date: initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(0, 16) : '',
      location: initialData?.location || '',
      is_members_only: initialData?.is_members_only || false,
      is_past_event: initialData?.is_past_event || false
    }
  });

  const onFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      event_date: new Date(data.event_date).toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-primary-600">
          Event Title
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
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="event_date" className="block text-sm font-medium text-primary-600">
          Event Date & Time
        </label>
        <input
          id="event_date"
          type="datetime-local"
          {...register('event_date', { required: 'Event date is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.event_date && (
          <p className="mt-1 text-sm text-red-600">{errors.event_date.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-primary-600">
          Location
        </label>
        <input
          id="location"
          {...register('location', { required: 'Location is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            id="is_members_only"
            type="checkbox"
            {...register('is_members_only')}
            className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
          />
          <label htmlFor="is_members_only" className="ml-2 block text-sm text-neutral-700">
            Members Only Event
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="is_past_event"
            type="checkbox"
            {...register('is_past_event')}
            className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
          />
          <label htmlFor="is_past_event" className="ml-2 block text-sm text-neutral-700">
            Past Event
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;