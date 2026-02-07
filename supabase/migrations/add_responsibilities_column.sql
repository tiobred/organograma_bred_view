-- Add responsibilities column to profiles table
ALTER TABLE profiles 
ADD COLUMN responsibilities TEXT;

-- Comment on column
COMMENT ON COLUMN profiles.responsibilities IS 'Detailed description of employee roles and responsibilities';
