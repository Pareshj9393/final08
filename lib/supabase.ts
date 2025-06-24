// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length
});

// Function to check if a string is a valid URL
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Create Supabase client
let supabase: any;
let connectionStatus = 'disconnected';

if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    connectionStatus = 'connected';
    console.log('✅ Supabase client created successfully');
    console.log('🔗 Connected to:', supabaseUrl);
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    connectionStatus = 'error';
  }
} else {
  console.error('❌ Supabase connection failed - missing or invalid credentials');
  console.log('Debug info:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing',
    validUrl: isValidUrl(supabaseUrl)
  });
  connectionStatus = 'missing_credentials';
}

// Create mock client if connection failed
if (!supabase || connectionStatus !== 'connected') {
  console.log('🔧 Creating mock Supabase client');
  supabase = {
    auth: {
      getUser: () => {
        console.log('🚫 Mock: getUser called');
        return Promise.resolve({ data: { user: null }, error: { message: 'Please connect to Supabase first' } });
      },
      signUp: () => {
        console.log('🚫 Mock: signUp called');
        return Promise.resolve({ data: { user: null }, error: { message: 'Please connect to Supabase first' } });
      },
      signInWithPassword: () => {
        console.log('🚫 Mock: signInWithPassword called');
        return Promise.resolve({ data: { user: null }, error: { message: 'Please connect to Supabase first' } });
      },
      signOut: () => {
        console.log('🚫 Mock: signOut called');
        return Promise.resolve({ error: null });
      },
      resend: () => {
        console.log('🚫 Mock: resend called');
        return Promise.resolve({ error: { message: 'Please connect to Supabase first' } });
      },
      onAuthStateChange: () => {
        console.log('🚫 Mock: onAuthStateChange called');
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => {
            console.log('🚫 Mock: database query called');
            return Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } });
          },
          maybeSingle: () => {
            console.log('🚫 Mock: database query called');
            return Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } });
          },
          order: () => {
            console.log('🚫 Mock: database query called');
            return Promise.resolve({ data: [], error: { message: 'Please connect to Supabase first' } });
          }
        }),
        order: () => {
          console.log('🚫 Mock: database query called');
          return Promise.resolve({ data: [], error: { message: 'Please connect to Supabase first' } });
        }
      }),
      insert: () => {
        console.log('🚫 Mock: database insert called');
        return Promise.resolve({ error: { message: 'Please connect to Supabase first' } });
      },
      upsert: () => ({
        select: () => ({
          single: () => {
            console.log('🚫 Mock: database upsert called');
            return Promise.resolve({ error: { message: 'Please connect to Supabase first' } });
          }
        })
      }),
      update: () => ({
        eq: () => {
          console.log('🚫 Mock: database update called');
          return Promise.resolve({ error: { message: 'Please connect to Supabase first' } });
        }
      }),
      delete: () => ({
        eq: () => {
          console.log('🚫 Mock: database delete called');
          return Promise.resolve({ error: { message: 'Please connect to Supabase first' } });
        }
      })
    }),
    storage: {
      from: () => ({
        upload: () => {
          console.log('🚫 Mock: storage upload called');
          return Promise.resolve({ error: { message: 'Please connect to Supabase first' } });
        }
      })
    },
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    })
  };
}

export { supabase };

export const isSupabaseConnected = connectionStatus === 'connected';

console.log('📊 Final connection status:', { isSupabaseConnected, connectionStatus });


// --- NEW AND UPDATED TYPES ---

export type Profile = {
  id: string;
  email: string;
  username: string;
  role: 'student' | 'donor';
  verification_status: 'unverified' | 'pending' | 'verified';
  created_at: string;
  avatar_url?: string; // Added for profile pictures
  donor_type?: string;
  bio?: string;
  organization?: string;
};

export type DonorProfile = {
  id: string;
  email: string;
  username: string;
  created_at: string;
  role: 'donor';
  verification_status: 'verified';
  avatar_url?: string;
};

export type Like = {
  id: number;
  post_id: string;
  user_id: string;
  created_at: string;
}

export type Comment = {
  id: string | number; // Modified to allow string or number
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile; // To show commenter's info
}

export type Post = {
  id: string;
  user_id: string;
  post_type: 'wisdom' | 'donation' | 'seeking';
  content?: string;
  resource_title?: string;
  resource_category?: string;
  resource_contact?: string;
  image_url?: string;
  created_at: string;
  profiles?: Profile;
  likes?: Like[];
  comments?: Comment[];
  link_url?: string | null; // Modified to allow null
  link_title?: string | null; // Modified to allow null
  link_description?: string | null; // Modified to allow null
  link_image?: string | null; // Modified to allow null
};

// New types
export type Message = {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
  };
  
  export type Notification = {
    id: string;
    user_id: string;
    type: string;
    actor_id: string;
    post_id?: string;
    is_read: boolean;
    created_at: string;
  };
  
  export type WishlistItem = {
    id: string;
    user_id: string;
    item_description: string;
    category?: string;
    is_fulfilled: boolean;
    created_at: string;
  };

