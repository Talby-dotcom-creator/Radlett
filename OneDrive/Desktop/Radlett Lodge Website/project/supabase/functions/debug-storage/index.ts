import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client using environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }
    
    // Get files from cms-media bucket if it exists
    let files = null;
    let filesError = null;
    const cmsMediaBucket = buckets.find(b => b.name === 'cms-media');
    
    if (cmsMediaBucket) {
      const result = await supabase.storage
        .from('cms-media')
        .list('', { limit: 100 });
      
      files = result.data;
      filesError = result.error;
    }
    
    // Get RLS policies for storage.objects
    const { data: policies, error: policiesError } = await supabase.rpc(
      'get_policies',
      { table_name: 'objects', schema_name: 'storage' }
    );
    
    // Return the debug information
    const debugInfo = {
      buckets,
      cmsMediaExists: !!cmsMediaBucket,
      files,
      filesError: filesError ? filesError.message : null,
      policies,
      policiesError: policiesError ? policiesError.message : null,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(debugInfo),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});