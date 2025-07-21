import React, { useState } from 'react';
import { testStorageBucket, callStorageDebugFunction } from '../utils/storageTest';
import Button from '../components/Button';
import { Database, FileUp, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const StorageDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [edgeFunctionLoading, setEdgeFunctionLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [edgeFunctionResult, setEdgeFunctionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestStorage = async () => {
    try {
      setLoading(true);
      setError(null);
      const testResult = await testStorageBucket();
      setResult(testResult);
    } catch (err) {
      console.error('Error testing storage:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCallDebugFunction = async () => {
    try {
      setEdgeFunctionLoading(true);
      setError(null);
      const debugResult = await callStorageDebugFunction();
      setEdgeFunctionResult(debugResult);
    } catch (err) {
      console.error('Error calling debug function:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setEdgeFunctionLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-heading font-bold text-primary-600 mb-8">
          Storage Debug Page
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-red-700">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-neutral-50 rounded-lg p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-primary-600 mb-4 flex items-center">
              <FileUp className="w-5 h-5 mr-2" />
              Client-Side Storage Test
            </h2>
            <p className="text-neutral-600 mb-4">
              Test storage bucket existence, permissions, and file operations directly from the browser.
            </p>
            <Button
              onClick={handleTestStorage}
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Testing Storage...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Run Storage Test
                </>
              )}
            </Button>
            
            {result && (
              <div className="mt-6 border-t border-neutral-200 pt-4">
                <div className="flex items-center mb-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <h3 className="font-medium">
                    {result.success ? 'Test Passed' : `Test Failed at step: ${result.step}`}
                  </h3>
                </div>
                
                <div className="bg-neutral-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64 mt-4">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-primary-600 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Server-Side Storage Debug
            </h2>
            <p className="text-neutral-600 mb-4">
              Call the debug-storage edge function to get detailed information about storage buckets and policies.
            </p>
            <Button
              onClick={handleCallDebugFunction}
              disabled={edgeFunctionLoading}
              className="w-full flex items-center justify-center"
            >
              {edgeFunctionLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Calling Function...
                </>
              ) : (
                <>
                  <Database size={16} className="mr-2" />
                  Call Debug Function
                </>
              )}
            </Button>
            
            {edgeFunctionResult && (
              <div className="mt-6 border-t border-neutral-200 pt-4">
                <h3 className="font-medium mb-2">Edge Function Response:</h3>
                <div className="bg-neutral-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
                  <pre>{JSON.stringify(edgeFunctionResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Check if the <code className="bg-blue-100 px-1 rounded">cms-media</code> bucket exists</li>
            <li>Verify that proper RLS policies are in place for the bucket</li>
            <li>Ensure the user has the 'admin' role in the member_profiles table</li>
            <li>Check for CORS issues in the browser console</li>
            <li>Verify that the Supabase URL and anon key are correctly set</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StorageDebugPage;