import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, Copy, Check } from 'lucide-react';

const ViteDebugPage: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Get all environment variables
  const envVars = import.meta.env;
  
  // Get Vite-specific info
  const viteInfo = {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    ssr: import.meta.env.SSR,
    baseUrl: import.meta.env.BASE_URL,
  };

  // Check for potential issues
  const issues = [];
  
  // Check for external base URL
  if (viteInfo.baseUrl && viteInfo.baseUrl !== '/') {
    issues.push({
      type: 'warning',
      message: `Base URL is set to "${viteInfo.baseUrl}" - this might cause asset loading issues`,
      suggestion: 'Ensure BASE_URL is correct for your deployment'
    });
  }

  // Check for missing Supabase config
  if (!envVars.VITE_SUPABASE_URL) {
    issues.push({
      type: 'error',
      message: 'VITE_SUPABASE_URL is not set',
      suggestion: 'Set VITE_SUPABASE_URL in your .env file'
    });
  }

  if (!envVars.VITE_SUPABASE_ANON_KEY) {
    issues.push({
      type: 'error',
      message: 'VITE_SUPABASE_ANON_KEY is not set',
      suggestion: 'Set VITE_SUPABASE_ANON_KEY in your .env file'
    });
  }

  // Check for suspicious URLs in env vars
  Object.entries(envVars).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes('bolt.new')) {
      issues.push({
        type: 'error',
        message: `Environment variable ${key} contains "bolt.new" URL`,
        suggestion: 'This might be causing assets to load from the wrong location'
      });
    }
  });

  const handleCopy = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-heading font-bold text-primary-600 mb-8">
          Vite Configuration Debug
        </h1>

        {/* Issues Section */}
        {issues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-600 mb-4">
              Potential Issues ({issues.length})
            </h2>
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getIssueColor(issue.type)}`}
                >
                  <div className="flex items-start">
                    {getIssueIcon(issue.type)}
                    <div className="ml-3">
                      <h3 className="font-medium">{issue.message}</h3>
                      <p className="text-sm mt-1 opacity-90">{issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.length === 0 && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-green-800 font-medium">No obvious configuration issues detected</span>
            </div>
          </div>
        )}

        {/* Vite Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-neutral-50 rounded-lg p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-primary-600 mb-4">Vite Configuration</h2>
            <div className="space-y-3">
              {Object.entries(viteInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-neutral-200 last:border-b-0">
                  <span className="font-medium text-neutral-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                      typeof value === 'boolean' 
                        ? value 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {String(value)}
                    </span>
                    <button
                      onClick={() => handleCopy(String(value), key)}
                      className="ml-2 p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                      title="Copy value"
                    >
                      {copiedItem === key ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-neutral-50 rounded-lg p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-primary-600 mb-4">Environment Variables</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(envVars)
                .filter(([key]) => key.startsWith('VITE_'))
                .map(([key, value]) => (
                  <div key={key} className="py-2 border-b border-neutral-200 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-neutral-700 text-sm break-all">
                        {key}:
                      </span>
                      <button
                        onClick={() => handleCopy(String(value), key)}
                        className="ml-2 p-1 text-neutral-500 hover:text-neutral-700 transition-colors flex-shrink-0"
                        title="Copy value"
                      >
                        {copiedItem === key ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <div className={`mt-1 p-2 rounded text-xs font-mono break-all ${
                      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {value || 'NOT SET'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* All Environment Variables (for debugging) */}
        <div className="mt-8 bg-neutral-50 rounded-lg p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-primary-600 mb-4">All Environment Variables</h2>
          <div className="bg-neutral-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
            <pre>{JSON.stringify(envVars, null, 2)}</pre>
          </div>
        </div>

        {/* Network Information */}
        <div className="mt-8 bg-neutral-50 rounded-lg p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-primary-600 mb-4">Current Page Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
              <span className="font-medium text-neutral-700">Current URL:</span>
              <div className="flex items-center">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded break-all">
                  {window.location.href}
                </span>
                <button
                  onClick={() => handleCopy(window.location.href, 'currentUrl')}
                  className="ml-2 p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                  title="Copy URL"
                >
                  {copiedItem === 'currentUrl' ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
              <span className="font-medium text-neutral-700">Origin:</span>
              <div className="flex items-center">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {window.location.origin}
                </span>
                <button
                  onClick={() => handleCopy(window.location.origin, 'origin')}
                  className="ml-2 p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                  title="Copy origin"
                >
                  {copiedItem === 'origin' ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-neutral-700">User Agent:</span>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded max-w-md truncate">
                {navigator.userAgent}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-3">Debugging Instructions</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. Check for asset loading issues:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Look for any environment variables containing "bolt.new" URLs</li>
              <li>Verify that BASE_URL is set correctly (should be "/" for most cases)</li>
              <li>Check if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly set</li>
            </ul>
            
            <p className="mt-4"><strong>2. Network tab investigation:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Open browser DevTools → Network tab</li>
              <li>Reload the page and look for failed requests</li>
              <li>Check the "Initiator" column for requests to bolt.new</li>
            </ul>
            
            <p className="mt-4"><strong>3. Console errors:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check browser console for any error messages</li>
              <li>Look specifically for module loading errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViteDebugPage;