import React from 'react';
import { useForm } from 'react-hook-form';
import { CMSPageContent } from '../../types';
import Button from '../Button';

interface PageContentFormProps {
  onSubmit: (data: Omit<CMSPageContent, 'id' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CMSPageContent>;
}

const PageContentForm: React.FC<PageContentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      page_name: initialData?.page_name || '',
      section_name: initialData?.section_name || '',
      content_type: initialData?.content_type || 'text',
      content: initialData?.content || ''
    }
  });

  const contentType = watch('content_type');

  const renderContentInput = () => {
    if (contentType === 'html') {
      return (
        <textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          rows={12}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500 font-mono text-sm"
          placeholder="<p>Enter HTML content here...</p>"
        />
      );
    }

    if (contentType === 'json') {
      return (
        <textarea
          id="content"
          {...register('content', { 
            required: 'Content is required',
            validate: (value) => {
              try {
                JSON.parse(value);
                return true;
              } catch {
                return 'Must be valid JSON';
              }
            }
          })}
          rows={8}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500 font-mono text-sm"
          placeholder='{"key": "value"}'
        />
      );
    }

    return (
      <textarea
        id="content"
        {...register('content', { required: 'Content is required' })}
        rows={6}
        className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        placeholder="Enter text content here..."
      />
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="page_name" className="block text-sm font-medium text-primary-600">
            Page Name
          </label>
          <select
            id="page_name"
            {...register('page_name', { required: 'Page name is required' })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
          >
            <option value="">Select a page</option>
            <option value="homepage">Homepage</option>
            <option value="about">About Page</option>
            <option value="join">Join Page</option>
            <option value="contact">Contact Page</option>
            <option value="events">Events Page</option>
            <option value="news">News Page</option>
            <option value="faq">FAQ Page</option>
          </select>
          {errors.page_name && (
            <p className="mt-1 text-sm text-red-600">{errors.page_name.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="section_name" className="block text-sm font-medium text-primary-600">
            Section Name
          </label>
          <input
            id="section_name"
            {...register('section_name', { required: 'Section name is required' })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
            placeholder="e.g., hero_title, welcome_text"
          />
          {errors.section_name && (
            <p className="mt-1 text-sm text-red-600">{errors.section_name.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="content_type" className="block text-sm font-medium text-primary-600">
          Content Type
        </label>
        <select
          id="content_type"
          {...register('content_type')}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        >
          <option value="text">Plain Text</option>
          <option value="html">HTML</option>
          <option value="json">JSON</option>
        </select>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-primary-600">
          Content
        </label>
        {renderContentInput()}
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message as string}</p>
        )}
        {contentType === 'html' && (
          <p className="mt-1 text-xs text-neutral-500">
            You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, etc.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Content'}
        </Button>
      </div>
    </form>
  );
};

export default PageContentForm;