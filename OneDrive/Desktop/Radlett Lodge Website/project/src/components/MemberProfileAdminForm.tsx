import React from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';
import { MemberProfile } from '../types';

interface MemberProfileAdminFormProps {
  onSubmit: (data: {
    user_id: string;
    full_name: string;
    status?: 'active' | 'pending' | 'inactive';
    position?: string;
    role: 'member' | 'admin';
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<MemberProfile>;
}

const MemberProfileAdminForm: React.FC<MemberProfileAdminFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      user_id: initialData?.user_id || '',
      full_name: initialData?.full_name || '',
      status: initialData?.status || 'pending',
      position: initialData?.position || '',
      role: initialData?.role || 'member',
      notes: initialData?.notes || ''
    }
  });

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="user_id" className="block text-sm font-medium text-primary-600">
          User ID
        </label>
        <input
          id="user_id"
          {...register('user_id', { required: 'User ID is required' })}
          disabled={isEditing}
          className={`mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500 ${
            isEditing ? 'bg-neutral-100 cursor-not-allowed' : ''
          }`}
        />
        {errors.user_id && (
          <p className="mt-1 text-sm text-red-600">{errors.user_id.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-primary-600">
          Status
        </label>
        <select
          id="status"
          {...register('status')}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p className="mt-1 text-xs text-neutral-500">
          Pending members have limited access until approved
        </p>
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
        <label htmlFor="position" className="block text-sm font-medium text-primary-600">
          Lodge Position
        </label>
        <input
          id="position"
          {...register('position')}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-primary-600">
          Role
        </label>
        <select
          id="role"
          {...register('role', { required: 'Role is required' })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-primary-600">
          Admin Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
          placeholder="Private notes about this member (only visible to admins)"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Profile')}
        </Button>
      </div>
    </form>
  );
};

export default MemberProfileAdminForm;