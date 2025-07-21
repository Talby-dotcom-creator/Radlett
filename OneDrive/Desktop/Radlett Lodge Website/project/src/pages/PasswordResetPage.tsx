import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { KeyRound, AlertTriangle } from 'lucide-react';

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  // Redirect logic
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // If not logged in, redirect to login
        navigate('/login', { replace: true });
      } else if (profile && !profile.needs_password_reset) {
        // If logged in but password reset not needed, redirect to members area
        navigate('/members', { replace: true });
      }
    }
  }, [authLoading, user, profile, navigate]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // 1. Update user's password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      // 2. Update the needs_password_reset flag in the member_profiles table
      if (user && profile) {
        await api.updateMemberProfile(user.id, { needs_password_reset: false });
        await refreshProfile(); // Refresh auth context profile
      }

      success('Your password has been successfully updated!');
      navigate('/members', { replace: true }); // Redirect to members area

    } catch (err) {
      console.error('Password reset error:', err);
      showError(err instanceof Error ? err.message : 'An unexpected error occurred during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while authentication status is being determined
  if (authLoading || (user && !profile)) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center pt-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  // If user is not logged in or doesn't need password reset, the useEffect will handle redirection.
  // This prevents rendering the form briefly before redirect.
  if (!user || !profile?.needs_password_reset) {
    return null;
  }

  return (
    <div className="min-h-screen pt-36 pb-20 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-500 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-primary-800" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary-600 mb-2">
              Password Reset Required
            </h1>
            <p className="text-neutral-600">
              For security reasons, you must set a new password to continue.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-medium">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-primary-600">
                  New Password *
                </label>
                <input
                  id="newPassword"
                  type="password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-600">
                  Confirm New Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match'
                  })}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    'Set New Password'
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Important Security Notice</p>
                <p>
                  You are required to change your password. This ensures the security of your account and our member area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;