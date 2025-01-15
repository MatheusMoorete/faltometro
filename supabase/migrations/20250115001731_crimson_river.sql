/*
  # Fix profiles table and triggers

  1. Changes
    - Update profiles table with CASCADE delete
    - Create automatic profile creation trigger
    
  2. Security
    - Update RLS policies if they don't exist
*/

-- Update profiles table constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

ALTER TABLE profiles
ADD CONSTRAINT profiles_pkey PRIMARY KEY (id),
ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();