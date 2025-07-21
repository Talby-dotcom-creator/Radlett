import React, { useEffect, useState } from 'react';

const DebugPage: React.FC = () => {
  const [envVars, setEnvVars] = useState<{
    supabaseUrl: string | undefined;
    supabaseAnonKey: string | undefined;
    nodeEnv: string | undefined;
  }>({
    supabaseUrl: undefined,
    supabaseAnonKey: undefined,
    nodeEnv: undefined
  });

  useEffect(() => {
    // Get environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const nodeEnv = import.meta.env.MODE;

    console.log('=== SUPABASE DEBUG INFO ===');
    console.log('VITE_SUPABASE_URL:', supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined');
    console.log('NODE_ENV/MODE:', nodeEnv);
    console.log('All env vars:', import.meta.env);
    console.log('=== END DEBUG INFO ===');

    setEnvVars({
      supabaseUrl,
      supabaseAnonKey,
      nodeEnv
    });
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-heading font-bold text-primary-600 mb-8">
          Supabase Configuration Debug
        </h1>
        
        <div className="bg-neutral-50 rounded-lg p-6 shadow-medium">
          <h2 className="text-xl font-semibold text-primary-600 mb-4">Environment Variables</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">VITE_SUPABASE_URL:</label>
              <div className={`mt-1 p-2 rounded ${envVars.supabaseUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {envVars.supabaseUrl || 'NOT SET'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700">VITE_SUPABASE_ANON_KEY:</label>
              <div className={`mt-1 p-2 rounded ${envVars.supabaseAnonKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {envVars.supabaseAnonKey ? `${envVars.supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700">Environment Mode:</label>
              <div className="mt-1 p-2 bg-blue-100 text-blue-800 rounded">
                {envVars.nodeEnv || 'unknown'}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Check the browser console for detailed debug information</li>
              <li>If environment variables are missing, you need to connect to Supabase</li>
              <li>Click the "Connect to Supabase" button in the top right of the interface</li>
              <li>Follow the setup instructions to configure your Supabase project</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;