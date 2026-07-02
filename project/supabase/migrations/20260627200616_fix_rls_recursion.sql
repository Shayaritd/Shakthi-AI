/*
# Fix RLS Infinite Recursion Issue

## Problem
The profiles table had an RLS policy that referenced the same table in a subquery,
causing infinite recursion when checking if a user is an admin.

## Solution
1. Create a security definer function that checks if a user is admin
2. Update the profiles admin policy to use this function
3. Simplify the athlete_profiles mentor check

## Changes
- Create is_admin() function with security definer
- Fix profiles SELECT policy for admins
- Fix other circular policy references
*/

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
    admin_role text;
BEGIN
    SELECT role INTO admin_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    RETURN admin_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check mentor role
CREATE OR REPLACE FUNCTION is_mentor()
RETURNS boolean AS $$
DECLARE
    mentor_role text;
BEGIN
    SELECT role INTO mentor_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    RETURN mentor_role = 'MENTOR';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop and recreate the problematic policies

-- Fix profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
    TO authenticated USING (is_admin());

-- Fix athlete_profiles policies
DROP POLICY IF EXISTS "Mentors can view athlete profiles" ON athlete_profiles;
CREATE POLICY "Mentors can view athlete profiles" ON athlete_profiles FOR SELECT
    TO authenticated USING (
        is_admin() = true
        OR is_mentor() = true
        OR auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM mentorship_requests 
            WHERE mentor_id = auth.uid() AND athlete_id = athlete_profiles.user_id 
            AND status IN ('APPROVED', 'PENDING', 'PENDING_GUARDIAN')
        )
    );

-- Fix other tables' admin policies
DROP POLICY IF EXISTS "Admins can manage scholarships" ON scholarships;
CREATE POLICY "Admins can manage scholarships" ON scholarships FOR ALL
    TO authenticated USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can manage colleges" ON colleges;
CREATE POLICY "Admins can manage colleges" ON colleges FOR ALL
    TO authenticated USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can manage opportunities" ON opportunities;
CREATE POLICY "Admins can manage opportunities" ON opportunities FOR ALL
    TO authenticated USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can manage resources" ON training_resources;
CREATE POLICY "Admins can manage resources" ON training_resources FOR ALL
    TO authenticated USING (is_admin() = true OR is_mentor() = true);

DROP POLICY IF EXISTS "Admins can view all reports" ON safety_reports;
CREATE POLICY "Admins can view all reports" ON safety_reports FOR SELECT
    TO authenticated USING (is_admin() = true);

DROP POLICY IF EXISTS "Admins can update reports" ON safety_reports;
CREATE POLICY "Admins can update reports" ON safety_reports FOR UPDATE
    TO authenticated USING (is_admin() = true);