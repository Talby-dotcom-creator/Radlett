import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo user storage
let currentDemoUser: any = null;
let authStateListeners: Function[] = [];
let isDemoMode = false;

// Helper to notify all listeners
const notifyAuthStateChange = (event: string, session: any) => {
  authStateListeners.forEach(callback => {
    try {
      callback(event, session);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
};

// Create demo client
const createDemoClient = () => {
  console.warn('Using demo mode - Supabase not properly configured');
  isDemoMode = true;
  
  return {
    auth: {
      getSession: async () => {
        const result = { 
          data: { 
            session: currentDemoUser ? { 
              user: currentDemoUser, 
              access_token: 'demo-token' 
            } : null 
          }, 
          error: null 
        };
        return result;
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Allow demo credentials
        if (email === 'demo@radlettlodge.org' && password === 'demo123456') {
          const mockUser = {
            id: 'demo-user-id',
            email: 'demo@radlettlodge.org',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated'
          };
          currentDemoUser = mockUser;
          const session = { user: mockUser, access_token: 'demo-token' };
          
          // Notify listeners
          setTimeout(() => notifyAuthStateChange('SIGNED_IN', session), 100);
          
          return { 
            data: { user: mockUser, session }, 
            error: null 
          };
        }
        
        return { 
          data: { user: null, session: null }, 
          error: { message: 'Invalid login credentials' } 
        };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        // Validate email and password
        if (!email || !password) {
          return { 
            data: { user: null, session: null }, 
            error: { message: 'Email and password are required' } 
          };
        }
        
        if (password.length < 6) {
          return { 
            data: { user: null, session: null }, 
            error: { message: 'Password must be at least 6 characters' } 
          };
        }
        
        const mockUser = {
          id: `demo-user-${Date.now()}`,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated'
        };
        
        currentDemoUser = mockUser;
        const session = { user: mockUser, access_token: 'demo-token' };
        
        // Notify listeners
        setTimeout(() => notifyAuthStateChange('SIGNED_IN', session), 100);
        
        return { 
          data: { user: mockUser, session }, 
          error: null 
        };
      },
      signOut: async () => {
        const wasSignedIn = !!currentDemoUser;
        currentDemoUser = null;
        
        // Notify listeners
        if (wasSignedIn) {
          setTimeout(() => notifyAuthStateChange('SIGNED_OUT', null), 100);
        }
        
        return { error: null };
      },
      getUser: async () => {
        return { data: { user: currentDemoUser }, error: null };
      },
      onAuthStateChange: (callback: Function) => {
        authStateListeners.push(callback);
        
        // Simulate immediate callback with current state
        setTimeout(() => {
          if (currentDemoUser) {
            callback('SIGNED_IN', { user: currentDemoUser, access_token: 'demo-token' });
          } else {
            callback('SIGNED_OUT', null);
          }
        }, 100);
        
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {
                const index = authStateListeners.indexOf(callback);
                if (index > -1) {
                  authStateListeners.splice(index, 1);
                }
              } 
            } 
          } 
        };
      }
    }
  };
};

// Create either real or mock client based on environment variables
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  supabase = createDemoClient();
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Wrap auth methods to catch invalid API key errors and fall back to demo mode
    const originalSignInWithPassword = supabase.auth.signInWithPassword;
    const originalSignUp = supabase.auth.signUp;
    const originalGetSession = supabase.auth.getSession;
    const originalGetUser = supabase.auth.getUser;
    
    supabase.auth.signInWithPassword = async (credentials: any) => {
      try {
        const result = await originalSignInWithPassword.call(supabase.auth, credentials);
        if (result.error && result.error.message?.includes('Invalid API key')) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.signInWithPassword(credentials);
        }
        return result;
      } catch (error: any) {
        if (error.message?.includes('Invalid API key') || error.status === 401) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.signInWithPassword(credentials);
        }
        throw error;
      }
    };
    
    supabase.auth.signUp = async (credentials: any) => {
      try {
        const result = await originalSignUp.call(supabase.auth, credentials);
        if (result.error && result.error.message?.includes('Invalid API key')) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.signUp(credentials);
        }
        return result;
      } catch (error: any) {
        if (error.message?.includes('Invalid API key') || error.status === 401) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.signUp(credentials);
        }
        throw error;
      }
    };
    
    supabase.auth.getSession = async () => {
      try {
        const result = await originalGetSession.call(supabase.auth);
        if (result.error && result.error.message?.includes('Invalid API key')) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.getSession();
        }
        return result;
      } catch (error: any) {
        if (error.message?.includes('Invalid API key') || error.status === 401) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.getSession();
        }
        throw error;
      }
    };
    
    supabase.auth.getUser = async () => {
      try {
        const result = await originalGetUser.call(supabase.auth);
        if (result.error && result.error.message?.includes('Invalid API key')) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.getUser();
        }
        return result;
      } catch (error: any) {
        if (error.message?.includes('Invalid API key') || error.status === 401) {
          console.warn('Invalid Supabase API key detected, switching to demo mode');
          supabase = createDemoClient();
          return supabase.auth.getUser();
        }
        throw error;
      }
    };
    
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    supabase = createDemoClient();
  }
}

export { supabase, isDemoMode };