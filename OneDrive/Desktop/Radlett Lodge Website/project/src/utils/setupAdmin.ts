import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export const setupAdminProfile = async () => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }
    
    console.log('Setting up admin profile for:', user.email);
    
    // Check if profile already exists
    const existingProfile = await api.getMemberProfile(user.id);
    
    if (existingProfile) {
      console.log('Profile exists:', existingProfile);
      
      // Update to admin and active status if not already
      if (existingProfile.role !== 'admin' || existingProfile.status !== 'active') {
        const updatedProfile = await api.updateMemberProfile(user.id, { 
          role: 'admin',
          position: 'Worshipful Master',
          status: 'active' // Ensure status is set to active
        });
        console.log('Profile updated to admin:', updatedProfile);
        return updatedProfile;
      }
      return existingProfile;
    } else {
      // Create new admin profile
      const newProfile = await api.adminCreateMemberProfile({
        user_id: user.id,
        full_name: 'Paul Talbot',
        status: 'active', // Ensure status is set to active
        role: 'admin',
        position: 'Worshipful Master'
      });
      console.log('Admin profile created:', newProfile);
      return newProfile;
    }
  } catch (error) {
    console.error('Error setting up admin profile:', error);
    throw error;
  }
};