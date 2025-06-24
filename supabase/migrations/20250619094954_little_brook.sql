/*
  # Create automatic profile creation trigger

  1. Database Function
    - `handle_new_user()` function to automatically create profiles
    - Triggered when new users are created in auth.users
    - Creates basic profile with default values

  2. Trigger Setup
    - `on_auth_user_created` trigger on auth.users table
    - Executes after INSERT to create corresponding profile
    - Ensures profile always exists for authenticated users

  3. Security
    - Function runs with SECURITY DEFINER (elevated privileges)
    - Bypasses RLS since it runs server-side
    - Maintains data integrity and user experience
*/

-- Function to create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1), -- Default username from email prefix
    'student', -- Default role for new users
    'unverified' -- Default verification status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();