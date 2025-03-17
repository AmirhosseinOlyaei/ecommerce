# Supabase Project Setup Guide

This guide will help you set up a new Supabase project for your ecommerce application.

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/projects)
2. Click on "New Project"
3. Enter project details:
   - Name: `ecommerce` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest to your users (West US recommended for US users)
4. Click "Create new project" and wait for it to be provisioned (5-10 minutes)

## Step 2: Set Up Database Tables

### Option A: Using Supabase CLI (recommended)

1. Install Supabase CLI globally:
   ```bash
   pnpm add supabase --global
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   - You'll need your project reference ID (found in your Supabase project URL)
   - You'll be prompted for your database password

3. The project already includes a migration file at `supabase/migrations/20250317004602_new-migration.sql`
   which creates all necessary tables. Push this migration:
   ```bash
   supabase db push
   ```

### Option B: Manual SQL Execution

1. Navigate to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Paste the SQL content from `supabase/migrations/20250317004602_new-migration.sql`
4. Run the query to create all tables, indexes, and relationships

## Step 3: Configure Authentication Schema

The auth schema needs to be set up properly for user authentication:

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Paste and run the following SQL:
   ```sql
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
   ```

## Step 4: Configure Row Level Security (RLS)

RLS is crucial for securing your database. Run the following SQL:

```sql
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
```

## Step 5: Configure Authentication Settings

1. In the Supabase dashboard, go to Authentication → Providers
2. Under Site URL, enter your application's URL (e.g., `http://localhost:3000` for development)
3. Enable Email Auth and select "Email + Password" sign-in method
4. Configure security features (Auth → Settings):
   - Enable "Confirm email" for added security
   - Enable "Secure email change" 
   - Enable "Secure password change"
   - Find and enable "Leaked Password Protection" 
   - Set minimum password length to 8
   - Set password requirements (lowercase, uppercase, numbers)
5. Save changes

## Step 6: Set Up Database Connection

1. Go to Project Settings → Database to find your connection strings
2. For Prisma, you need:
   - `DATABASE_URL`: The connection string with connection pooling
   - `DIRECT_URL`: The direct connection string (no pooling)

3. Create or update your `.env.local` file with:
   ```
   # Supabase Auth API
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Database connection for Prisma
   DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
   ```

## Step 7: Start Your Application

1. Run your application:
   ```bash
   pnpm run dev
   ```
2. Test authentication by creating a new user
3. Verify that the user is created in Supabase and the profile and role entries are created automatically

## Database Management

### Using Prisma with Supabase

1. Prisma Schema: The schema is defined in `prisma/schema.prisma`
2. Generating Client: Run `pnpm prisma generate` after schema changes
3. Pushing Schema Changes: Use `pnpm prisma db push`

### Using Supabase Migrations

1. Creating a New Migration:
   ```bash
   supabase migration new migration-name
   ```
2. This creates a new SQL file in `supabase/migrations/`
3. Edit the file with your SQL changes
4. Push migrations:
   ```bash
   supabase db push
   ```

## Troubleshooting

If you encounter any issues:

1. Database Schema Issues:
   - Check `supabase/migrations/` for migration history
   - Verify table structures with `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
   - Check for cross-schema references in constraints

2. Authentication Issues:
   - Verify environment variables are correct
   - Look at Supabase logs in the dashboard under "Database" → "Logs"
   - Check for auth schema existence with `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth'`

3. Connection Issues:
   - Verify DATABASE_URL is formatted correctly
   - Test connection with a simple query
   - Check permissions with `SELECT * FROM pg_roles`

## Security Notes

- Never commit `.env.local` with your actual keys to version control
- The `service_role` key has admin privileges and should only be used securely on the server-side
- Always use Row Level Security to protect your data
- Set up secure password policies to protect user accounts 