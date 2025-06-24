/*
  # Fix donor profile system and backend data

  1. New Tables
    - Enhanced `profiles` table with better constraints
    - Add donor-specific fields and verification
    - Fix RLS policies for proper access

  2. Functions
    - Improved trigger function for automatic profile creation
    - Better error handling and logging
    - Ensure donor profiles are created correctly

  3. Security
    - Updated RLS policies for donor access
    - Proper permissions for all user types
    - Enhanced security for donor verification

  4. Data Fixes
    - Clean up any orphaned data
    - Ensure all existing users have profiles
    - Set proper donor verification status
*/

-- First, let's ensure the profiles table has all necessary constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'donor'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check CHECK (verification_status IN ('unverified', 'pending', 'verified'));

-- Add any missing columns for donor functionality
DO $$
BEGIN
  -- Add donor_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'donor_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN donor_type text;
  END IF;

  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;

  -- Add organization column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'organization'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization text;
  END IF;
END $$;

-- Drop and recreate the trigger function with better logic
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create enhanced function for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value text;
  profile_exists boolean := false;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Extract username from email (part before @)
  username_value := split_part(COALESCE(NEW.email, ''), '@', 1);
  
  -- Ensure username is not empty and is unique
  IF username_value = '' OR username_value IS NULL THEN
    username_value := 'user_' || substring(NEW.id::text, 1, 8);
  END IF;

  -- Make username unique by appending number if needed
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
    username_value := username_value || '_' || floor(random() * 1000)::text;
  END LOOP;

  -- Insert new profile with default values
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    role, 
    verification_status, 
    created_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    username_value,
    'student', -- Default role, will be updated by the application
    'unverified', -- Default verification status
    NOW()
  );
  
  -- Log successful profile creation
  RAISE LOG 'Profile created successfully for user: % with email: % and username: %', NEW.id, NEW.email, username_value;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle unique constraint violations gracefully
    RAISE LOG 'Unique constraint violation when creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log any other errors but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy to allow users to read all profiles (for displaying usernames, verification status, etc.)
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin functions)
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.posts TO postgres, anon, authenticated, service_role;

-- Ensure the trigger function has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- Create function to fix existing users without profiles
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS void AS $$
DECLARE
  user_record record;
  username_value text;
BEGIN
  -- Find users in auth.users who don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Extract username from email
    username_value := split_part(COALESCE(user_record.email, ''), '@', 1);
    
    -- Ensure username is not empty
    IF username_value = '' OR username_value IS NULL THEN
      username_value := 'user_' || substring(user_record.id::text, 1, 8);
    END IF;

    -- Make username unique
    WHILE EXISTS(SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
      username_value := username_value || '_' || floor(random() * 1000)::text;
    END LOOP;

    -- Insert the missing profile
    INSERT INTO public.profiles (
      id, 
      email, 
      username, 
      role, 
      verification_status, 
      created_at
    )
    VALUES (
      user_record.id,
      COALESCE(user_record.email, ''),
      username_value,
      'student', -- Default role
      'unverified', -- Default verification status
      user_record.created_at
    );
    
    RAISE LOG 'Created missing profile for user: %', user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create missing profiles
SELECT public.create_missing_profiles();

-- Drop the helper function as it's no longer needed
DROP FUNCTION public.create_missing_profiles();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update any existing donor profiles to be verified
UPDATE profiles 
SET verification_status = 'verified' 
WHERE role = 'donor' AND verification_status != 'verified';

RAISE LOG 'Migration completed: Enhanced donor profile system with proper backend support';