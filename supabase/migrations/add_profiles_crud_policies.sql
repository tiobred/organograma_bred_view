-- Execute this SQL in Supabase Dashboard > SQL Editor
-- This adds RLS policies to allow INSERT, UPDATE, and DELETE operations on the profiles table

-- Policy to allow anyone to insert profiles (for admin operations)
CREATE POLICY "Allow public insert on profiles"
ON profiles
FOR INSERT
TO public
WITH CHECK (true);

-- Policy to allow anyone to update profiles (for admin operations)
CREATE POLICY "Allow public update on profiles"
ON profiles
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy to allow anyone to delete profiles (for admin operations)
CREATE POLICY "Allow public delete on profiles"
ON profiles
FOR DELETE
TO public
USING (true);
