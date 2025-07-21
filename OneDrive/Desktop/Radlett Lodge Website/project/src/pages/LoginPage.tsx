import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import { AlertCircle, UserPlus, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const [showDemo, setShowDemo] = useState(false);

  if (user) {
    return <Navigate to="/members" replace />;
  }

  return (
    <div className="min-h-screen pt-36 pb-20 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary-600 mb-2">
              Member Access
            </h1>
            <p className="text-neutral-600">
              Sign in to access the Members Area or create a new account
            </p>
          </div>
          
          {/* Demo Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h3 className="font-medium text-blue-800 mb-2">Demo Mode Available</h3>
                <p className="text-blue-700 mb-3">
                  You can test the member system by:
                </p>
                <div className="space-y-2 text-blue-700">
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span>Creating a new demo account with any email/password</span>
                  </div>
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    <span>Using the pre-configured demo credentials</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemo(!showDemo)}
                  className="text-blue-600 hover:text-blue-800 underline text-sm mt-3"
                >
                  {showDemo ? 'Hide' : 'Show'} Demo Credentials
                </button>
                {showDemo && (
                  <div className="mt-3 p-3 bg-blue-100 rounded border text-blue-800">
                    <p className="font-medium mb-1">Demo Admin Account:</p>
                    <p><strong>Email:</strong> demo@radlettlodge.org</p>
                    <p><strong>Password:</strong> demo123456</p>
                    <p className="text-xs mt-2 text-blue-600">
                      This account has admin privileges to test all features
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-medium">
            <AuthForm />
          </div>
          
          {/* Features Overview */}
          <div className="mt-8 bg-white rounded-lg p-6 shadow-soft">
            <h3 className="font-heading font-semibold text-primary-600 mb-4">Member Area Features</h3>
            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-secondary-500 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5">1</span>
                <div>
                  <p><strong>Lodge Documents:</strong> Access important communications, bylaws, and forms</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-secondary-500 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5">2</span>
                <div>
                  <p><strong>Meeting Minutes:</strong> Review records of past Lodge meetings</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-secondary-500 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5">3</span>
                <div>
                  <p><strong>Member Directory:</strong> Connect with fellow Lodge members</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-secondary-500 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5">4</span>
                <div>
                  <p><strong>Admin Tools:</strong> Manage content and member profiles (admin only)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;