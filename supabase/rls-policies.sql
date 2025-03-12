-- Create profiles table to store extended user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT
);

-- Create user_role enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create custom claims table for extending JWT with user roles
CREATE TABLE IF NOT EXISTS auth.users_with_role (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer'
);

-- Create trigger function to create profile and role entry on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  
  -- Create role record with default 'customer' role
  INSERT INTO auth.users_with_role (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users_with_role ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
-- 1. Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. Allow admin users to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Allow admin users to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for the users_with_role table
-- 1. Allow admin users to view all roles
CREATE POLICY "Admins can view all roles"
  ON auth.users_with_role
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Allow admin users to update all roles
CREATE POLICY "Admins can update all roles"
  ON auth.users_with_role
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Allow users to view their own role
CREATE POLICY "Users can view own role"
  ON auth.users_with_role
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to get user role for the JWT
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM auth.users_with_role WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Set up JWT claims to include user role
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb AS $$
  DECLARE
    result jsonb;
    role user_role;
  BEGIN
    -- Get the default JWT claims
    result := (
      SELECT jsonb_build_object(
        'aud', aud,
        'sub', sub,
        'exp', exp,
        'role', coalesce(auth.get_user_role(), 'customer')
      )
      FROM (
        SELECT 
          nullif(current_setting('request.jwt.claim.aud', true), '')::text AS aud,
          nullif(current_setting('request.jwt.claim.sub', true), '')::text AS sub,
          nullif(current_setting('request.jwt.claim.exp', true), '')::text AS exp
      ) AS jwt
    );

    -- Return the new JWT payload
    RETURN result;
  END;
$$ LANGUAGE plpgsql STABLE;
