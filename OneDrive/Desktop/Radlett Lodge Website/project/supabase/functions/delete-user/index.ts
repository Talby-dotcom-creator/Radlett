import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DeleteUserRequest {
  user_id: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client to verify the requesting user is an admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the requesting user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('member_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    const { user_id }: DeleteUserRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prevent admin from deleting themselves
    if (user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Attempting to delete user:', user_id);

    // First, check if the user exists in auth.users
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (getUserError) {
      console.error('Error checking if user exists:', getUserError);
      return new Response(
        JSON.stringify({ error: `User not found: ${getUserError.message}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!existingUser.user) {
      console.error('User does not exist in auth.users:', user_id);
      // User doesn't exist in auth, but might exist in member_profiles
      // Let's clean up the profile if it exists
      const { error: deleteProfileError } = await supabaseAdmin
        .from('member_profiles')
        .delete()
        .eq('user_id', user_id);

      if (deleteProfileError) {
        console.error('Error deleting orphaned profile:', deleteProfileError);
      }

      return new Response(
        JSON.stringify({ error: 'User not found in authentication system' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User exists, proceeding with deletion');

    // Delete the member profile first
    const { error: deleteProfileError } = await supabaseAdmin
      .from('member_profiles')
      .delete()
      .eq('user_id', user_id);

    if (deleteProfileError) {
      console.error('Error deleting member profile:', deleteProfileError);
      return new Response(
        JSON.stringify({ error: `Failed to delete member profile: ${deleteProfileError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Profile deleted, now deleting auth user');

    // Delete the user from auth.users using admin client
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    
    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError);
      return new Response(
        JSON.stringify({ error: `Failed to delete user authentication record: ${deleteAuthError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User successfully deleted');

    return new Response(
      JSON.stringify({ message: 'User and profile deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});