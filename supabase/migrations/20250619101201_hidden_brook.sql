/*
  # Fix profile creation trigger for new users

  1. Database Functions
    - Drop and recreate the handle_new_user function with better error handling
    - Ensure the trigger works for all new user signups
    - Add logging for debugging

  2. Security
    - Maintain RLS policies
    - Ensure proper permissions for the trigger function
*/

-- Drop existing function and trigger to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value text;
BEGIN
  -- Extract username from email (part before @)
  username_value := split_part(NEW.email, '@', 1);
  
  -- Ensure username is not empty
  IF username_value = '' OR username_value IS NULL THEN
    username_value := 'user_' || substring(NEW.id::text, 1, 8);
  END IF;

  -- Insert new profile with default values
  INSERT INTO public.profiles (id, email, username, role, verification_status, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    username_value,
    'student', -- Default role, will be updated by the application
    'unverified', -- Default verification status
    NOW()
  );
  
  -- Log the profile creation (optional, for debugging)
  RAISE LOG 'Profile created for user: % with email: %', NEW.id, NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- Ensure the trigger function has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;