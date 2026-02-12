-- Profiles table already created by previous run, skip if exists
-- CREATE TABLE IF NOT EXISTS public.profiles was already applied

-- Create user_role enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create custom claims table in PUBLIC schema (auth schema is restricted on hosted Supabase)
CREATE TABLE IF NOT EXISTS public.users_with_role (
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
  INSERT INTO public.users_with_role (user_id, role)
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
ALTER TABLE public.users_with_role ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.users_with_role;
DROP POLICY IF EXISTS "Admins can update all roles" ON public.users_with_role;
DROP POLICY IF EXISTS "Users can view own role" ON public.users_with_role;

-- Create policies for the profiles table
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for the users_with_role table
CREATE POLICY "Admins can view all roles"
  ON public.users_with_role
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all roles"
  ON public.users_with_role
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_with_role
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own role"
  ON public.users_with_role
  FOR SELECT
  USING (auth.uid() = user_id);

-- Enable RLS on Product/Order/OrderItem tables
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Drop existing product/order policies if they exist
DROP POLICY IF EXISTS "Products are viewable by everyone" ON "Product";
DROP POLICY IF EXISTS "Products are editable by authenticated users only" ON "Product";
DROP POLICY IF EXISTS "Users can view their own orders" ON "Order";
DROP POLICY IF EXISTS "Users can create their own orders" ON "Order";
DROP POLICY IF EXISTS "Users can update their own orders" ON "Order";
DROP POLICY IF EXISTS "Users can view their order items" ON "OrderItem";
DROP POLICY IF EXISTS "Users can create order items for their orders" ON "OrderItem";

-- Product policies
CREATE POLICY "Products are viewable by everyone"
  ON "Product"
  FOR SELECT
  USING (true);

CREATE POLICY "Products are editable by authenticated users only"
  ON "Product"
  FOR ALL
  USING (current_user IS NOT NULL)
  WITH CHECK (current_user IS NOT NULL);

-- Order policies
CREATE POLICY "Users can view their own orders"
  ON "Order"
  FOR SELECT
  USING ("userId"::uuid = auth.uid());

CREATE POLICY "Users can create their own orders"
  ON "Order"
  FOR INSERT
  WITH CHECK ("userId"::uuid = auth.uid());

CREATE POLICY "Users can update their own orders"
  ON "Order"
  FOR UPDATE
  USING ("userId"::uuid = auth.uid())
  WITH CHECK ("userId"::uuid = auth.uid());

-- OrderItem policies
CREATE POLICY "Users can view their order items"
  ON "OrderItem"
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order"."id" = "OrderItem"."orderId"
    AND "Order"."userId"::uuid = auth.uid()
  ));

CREATE POLICY "Users can create order items for their orders"
  ON "OrderItem"
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order"."id" = "OrderItem"."orderId"
    AND "Order"."userId"::uuid = auth.uid()
  ));

-- Grant necessary permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON "Product" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON "Order" TO authenticated;
GRANT SELECT, INSERT ON "OrderItem" TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.users_with_role TO authenticated;
