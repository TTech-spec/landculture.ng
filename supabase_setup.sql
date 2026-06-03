-- ============================================================
-- Sales Path Finder — Supabase Setup
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hnstmhqxppjjotgejkvy/sql/new
-- ============================================================

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL DEFAULT '',
  email      TEXT        NOT NULL DEFAULT '',
  phone      TEXT        NOT NULL DEFAULT '',
  team       TEXT        NOT NULL DEFAULT '',
  branch     TEXT        NOT NULL DEFAULT '',
  role       TEXT        NOT NULL DEFAULT '',
  status     TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies in case they exist from a previous attempt
DROP POLICY IF EXISTS "Users can view own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Allow service insert on signup" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert"            ON public.profiles;

-- 4. Allow authenticated users to read their own profile (used by the login check)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 5. Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Trigger function — runs as the database owner (SECURITY DEFINER),
--    so it bypasses RLS and can always insert the profile record.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, team, branch, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name',   ''),
    COALESCE(NEW.raw_user_meta_data->>'phone',  ''),
    COALESCE(NEW.raw_user_meta_data->>'team',   ''),
    COALESCE(NEW.raw_user_meta_data->>'branch', ''),
    COALESCE(NEW.raw_user_meta_data->>'role',   ''),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 7. Remove any broken trigger that may be causing "Database error saving new user"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 8. Re-create the trigger cleanly
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- LEADS TABLE
-- ============================================================

-- 9. Create the leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id            TEXT        PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  phone         TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  location      TEXT        NOT NULL,
  source        TEXT        NOT NULL,
  temperature   TEXT        NOT NULL CHECK (temperature IN ('Hot', 'Warm', 'Cold')),
  stage         TEXT        NOT NULL CHECK (stage IN ('Lead', 'Pre-Qualified', 'Qualified', 'Inspection Booked', 'Inspection Completed', 'Closed Won', 'Closed Lost')),
  notes         TEXT        NOT NULL DEFAULT '',
  follow_up_date DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Enable Row Level Security for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 11. Drop old policies for leads
DROP POLICY IF EXISTS "Users can view own leads"   ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads"     ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

-- 12. Allow authenticated users to read their own leads
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

-- 13. Allow authenticated users to insert leads
CREATE POLICY "Users can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 14. Allow authenticated users to update their own leads
CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 15. Allow authenticated users to delete their own leads
CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- 16. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- 17. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ADMIN APPROVAL
-- ============================================================
-- In the Supabase Table Editor > profiles, change a user's
-- status from 'pending' to 'approved' to grant dashboard access.
--
-- Or via SQL:
--   UPDATE public.profiles SET status = 'approved' WHERE email = 'user@example.com';
--   UPDATE public.profiles SET status = 'rejected' WHERE email = 'user@example.com';
-- ============================================================
