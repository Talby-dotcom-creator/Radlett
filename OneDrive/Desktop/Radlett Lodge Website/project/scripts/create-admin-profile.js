// Simple script to create admin profile for existing user
// Run this in your browser console when logged in as ptalbot37@gmail.com

async function createAdminProfile() {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Not authenticated:', userError);
      return;
    }
    
    console.log('Current user:', user.email, user.id);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await window.supabase
      .from('member_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      
      // Update to admin if not already
      if (existingProfile.role !== 'admin') {
        const { data: updatedProfile, error: updateError } = await window.supabase
          .from('member_profiles')
          .update({ role: 'admin' })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating profile to admin:', updateError);
        } else {
          console.log('Profile updated to admin:', updatedProfile);
        }
      }
    } else {
      // Create new admin profile
      const { data: newProfile, error: createError } = await window.supabase
        .from('member_profiles')
        .insert({
          user_id: user.id,
          full_name: 'Paul Talbot',
          role: 'admin',
          position: 'Worshipful Master'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
      } else {
        console.log('Admin profile created:', newProfile);
      }
    }
    
    // Refresh the page to update the UI
    window.location.reload();
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createAdminProfile();