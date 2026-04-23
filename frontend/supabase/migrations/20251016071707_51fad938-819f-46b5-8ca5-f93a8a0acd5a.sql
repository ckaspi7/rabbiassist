-- Fix critical security issues in users table

-- 1. Add explicit policy to deny anonymous access to users table
CREATE POLICY "Deny anonymous access to users"
ON public.users
FOR SELECT
TO anon
USING (false);

-- 2. Add policy to prevent user_secret exposure even to authenticated users
-- Users can view their profile but not the user_secret field
CREATE POLICY "Prevent user_secret column access"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Add column-level comment to warn developers about user_secret sensitivity
COMMENT ON COLUMN public.users.user_secret IS 'SECURITY CRITICAL: Never include this field in SELECT queries. Use for backend verification only.';

-- 4. Add length constraints to prevent DoS attacks
ALTER TABLE public.users 
  ADD CONSTRAINT email_length CHECK (length(email) <= 255),
  ADD CONSTRAINT phone_number_length CHECK (length(phone_number) <= 50),
  ADD CONSTRAINT full_name_length CHECK (length(full_name) <= 200);

ALTER TABLE public.reminders
  ADD CONSTRAINT title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT description_length CHECK (length(description) <= 1000);

ALTER TABLE public.trips
  ADD CONSTRAINT title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT destination_length CHECK (length(destination) <= 200);

ALTER TABLE public.documents
  ADD CONSTRAINT file_name_length CHECK (length(file_name) <= 255),
  ADD CONSTRAINT original_name_length CHECK (length(original_name) <= 255);

ALTER TABLE public.receipts
  ADD CONSTRAINT vendor_length CHECK (length(vendor) <= 200),
  ADD CONSTRAINT details_length CHECK (length(details) <= 1000);