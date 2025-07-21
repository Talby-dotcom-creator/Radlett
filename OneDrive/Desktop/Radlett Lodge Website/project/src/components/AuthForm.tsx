import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(`Attempting to ${mode} with email:`, email);
      
      if (mode === 'signin') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        
        if (authError) {
          console.error('Sign in error:', authError);
          throw authError;
        }
        
        if (data.user) {
          console.log('Sign in successful:', data.user.email);
          success('Successfully signed in!');
          
          // Give the auth context time to update
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 500);
        } else {
          throw new Error('No user returned from sign in');
        }
      } else {
        // Validate inputs for signup
        if (!fullName.trim()) {
          throw new Error('Full name is required');
        }
        if (!email.trim()) {
          throw new Error('Email is required');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        console.log('Creating new account for:', email);
        const { data, error: authError } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password 
        });
        
        if (authError) {
          console.error('Signup error:', authError);
          throw authError;
        }
        
        console.log('Sign up response:', data);
        
        if (data.user) {
          console.log('User created successfully:', data.user.email);
          
          // Try to create member profile, but don't fail if database isn't connected
          try {
            console.log('Attempting to create member profile...');
            await api.createMemberProfile(data.user.id, fullName);
            console.log('Member profile created successfully with pending status');
            
            // Show success message and redirect to pending page
            success('Account created successfully! Your membership is pending approval.');
            setTimeout(() => {
              navigate('/members');
            }, 2000);
          } catch (profileError) {
            console.warn('Could not create profile (database not connected):', profileError);
            // Don't throw error - user can still access demo mode
            success('Account created successfully! You can now sign in.');
            
            // Switch to sign-in mode and pre-fill the email
            setMode('signin');
            setPassword('');
            setFullName('');
          }
        } else {
          console.warn('No user returned from signup');
          success('Account creation initiated. Please check your email if confirmation is required.');
        }
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <div>
            <label htmlFor="fullName\" className="block text-sm font-medium text-primary-600">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={mode === 'signup'}
              placeholder="Enter your full name"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-600">
            Email address *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-600">
            Password * {mode === 'signup' && <span className="text-sm text-neutral-500">(min 6 characters)</span>}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              // Clear form when switching modes except email
              setPassword('');
              setFullName('');
            }}
            className="text-secondary-500 hover:text-secondary-600"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>
      
      {/* Quick Demo Button - only show for sign in */}
      {mode === 'signin' && (
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-3 text-center">
            Or try the demo:
          </p>
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setEmail('demo@radlettlodge.org');
              setPassword('demo123456');
            }}
          >
            Fill Demo Credentials
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;