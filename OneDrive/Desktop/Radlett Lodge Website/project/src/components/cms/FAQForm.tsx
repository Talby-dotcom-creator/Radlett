import React from 'react';
import { useForm } from 'react-hook-form';
import { CMSFAQItem } from '../../types';
import Button from '../Button';

interface FAQFormProps {
  onSubmit: (data: Omit<CMSFAQItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CMSFAQItem>;
}

const FAQForm: React.FC<FAQFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      question: initialData?.question || '',
      answer: initialData?.answer || '',
      sort_order: initialData?.sort_order || 0,
      is_published: initialData?.is_published !== undefined ? initialData.is_published : true
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-primary-600">
          Question
        </label>
        <input
          id="question"
          {...register('question', { required: 'Question is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-primary-600">
          Answer
        </label>
        <textarea
          id="answer"
          {...register('answer', { required: 'Answer is required' })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
        {errors.answer && (
          <p className="mt-1 text-sm text-red-600">{errors.answer.message as string}</p>
        )}
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
          {isSubmitting ? 'Saving...' : 'Save FAQ'}
        </Button>
      </div>
    </form>
  );
};

export default FAQForm;