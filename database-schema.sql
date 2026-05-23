-- ========================================================================
--             NSS DIGITAL HUB - MASTER DATABASE SCHEMA & POLICIES
-- ========================================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard (https://supabase.com).
-- 2. Select your Project.
-- 3. Click on the "SQL Editor" tab in the left sidebar.
-- 4. Click "New Query" and paste this entire code block.
-- 5. Click the "Run" button at the bottom right.
-- ========================================================================

-- ------------------------------------------------------------------------
-- 1. CREATE CORE TABLES IF THEY DO NOT EXIST
-- ------------------------------------------------------------------------

-- Create Profiles Table (Contains Volunteers, Administrators, and HODs)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  unit TEXT,
  mobile TEXT DEFAULT '0000000000',
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'volunteer', -- 'volunteer', 'admin', 'hod'
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  department TEXT NOT NULL DEFAULT 'English'
);

-- Ensure department column exists in profiles (for legacy migrations)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'English';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile TEXT DEFAULT '0000000000';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create Pending Onboarding Table
CREATE TABLE IF NOT EXISTS public.pending_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  unit TEXT,
  mobile TEXT,
  password TEXT NOT NULL,
  department TEXT DEFAULT 'English',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'English';

-- Create Marked Attendance Table
CREATE TABLE IF NOT EXISTS public.marked_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_name TEXT NOT NULL,
  unit TEXT,
  status TEXT DEFAULT 'Present',
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 2. DROP FOREIGN KEY CONSTRAINTS BLOCKING DIRECT ENROLLMENT
-- ------------------------------------------------------------------------
-- Some templates automatically link public.profiles.id to auth.users.id.
-- If this exists, direct registrations (e.g. HODs, custom volunteers) fail.
-- Running this command unties that constraint safely.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ------------------------------------------------------------------------
-- 3. OPTIMIZING DATABASE VALUE INDEXES FOR INTENSE FILTERING
-- ------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_department 
ON public.profiles(department);

CREATE INDEX IF NOT EXISTS idx_marked_attendance_volunteer_name 
ON public.marked_attendance(volunteer_name);

-- ------------------------------------------------------------------------
-- 4. CONFIGURE ROW LEVEL SECURITY (RLS) FOR FULL APP COMPATIBILITY
-- ------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marked_attendance ENABLE ROW LEVEL SECURITY;

-- Clean existing policies so we don't end up with conflicting rules
DROP POLICY IF EXISTS "Allows HODs to view profiles of their department" ON public.profiles;
DROP POLICY IF EXISTS "Allows selection of profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allows full access to profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allows HODs to view attendance logs of department volunteers" ON public.marked_attendance;
DROP POLICY IF EXISTS "Allows select of attendance logs" ON public.marked_attendance;
DROP POLICY IF EXISTS "Allows full access to attendance logs" ON public.marked_attendance;

DROP POLICY IF EXISTS "Allows public/admins to select and write pending entries" ON public.pending_requests;

-- Write wide-open policies allowing all read/write sequences for public profiles 
-- (Ensures no "infinite recursion", "database blocked" or RLS-denied issues)

CREATE POLICY "Allows full access to profiles"
ON public.profiles
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allows full access to attendance logs"
ON public.marked_attendance
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allows full access to pending requests"
ON public.pending_requests
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------
-- 5. SEPARATE TABLE AND POLICIES FOR HEAD OF DEPARTMENTS (HOD)
-- ------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.hod_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  mobile TEXT DEFAULT '0000000000',
  password TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hod_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allows full access to hod_profiles" ON public.hod_profiles;
CREATE POLICY "Allows full access to hod_profiles"
ON public.hod_profiles
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);
