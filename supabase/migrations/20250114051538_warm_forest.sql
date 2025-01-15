/*
  # Fix Profile Policies

  1. Changes
    - Add INSERT policy for profiles table to allow users to create their own profile during signup
    
  2. Security
    - Maintains existing RLS policies
    - Adds new policy for profile creation
*/

-- Add policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);