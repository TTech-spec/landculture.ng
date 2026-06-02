-- ============================================================
-- Sales Path Finder — Supabase Setup
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/adixsscckgwimuzhmnqp/sql/new
-- ============================================================

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  phone      TEXT        NOT NULL,
  team       TEXT        NOT NULL,
  branch     TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 4. Allow users to insert their own profile (on registration)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. (Optional) Allow admins to view and update all profiles
--    Create a service-role key in your backend or use the Supabase dashboard
--    to approve/reject users by updating the status column:
--
--    UPDATE public.profiles SET status = 'approved' WHERE email = 'user@example.com';
--    UPDATE public.profiles SET status = 'rejected' WHERE email = 'user@example.com';

-- ============================================================
-- ADMIN APPROVAL GUIDE
-- ============================================================
-- To approve a user in Supabase dashboard:
--   1. Go to Table Editor > profiles
--   2. Find the user row (status = 'pending')
--   3. Edit the row and change status to 'approved'
--
-- Or via SQL:
--   UPDATE public.profiles SET status = 'approved' WHERE email = 'user@example.com';
-- ============================================================
