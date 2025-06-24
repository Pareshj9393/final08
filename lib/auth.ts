import { supabase } from './supabase';

export async function signUp(email: string, password: string, role: 'student' | 'donor') {
  try {
    console.log('🚀 Starting signup for:', email, 'as', role);
    
    // Enable email confirmation and pass role in metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/?verified=true`,
        data: {
          role: role // This will be read by the database trigger
        }
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }

    console.log('✅ Signup successful - verification email sent');
    return data;
  } catch (error) {
    console.error('❌ SignUp error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('🔑 Signing in:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ SignIn error:', error);
      throw error;
    }

    console.log('✅ SignIn successful');
    return data;
  } catch (error) {
    console.error('❌ SignIn error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ SignOut successful');
  } catch (error) {
    console.error('❌ SignOut error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('❌ GetCurrentUser error:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    console.log('🔍 Fetching profile for:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

    if (error) {
      console.error('❌ Profile fetch error:', error);
      throw error;
    }

    if (data) {
      console.log('✅ Profile found:', data);
      return data;
    } else {
      console.log('📝 No profile found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ GetUserProfile error:', error);
    return null;
  }
}

export async function resendVerificationEmail() {
  try {
    // Get current user first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      throw new Error('No user found or email missing');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/?verified=true`
      }
    });

    if (error) throw error;
    console.log('✅ Verification email resent');
    return true;
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    throw error;
  }
}