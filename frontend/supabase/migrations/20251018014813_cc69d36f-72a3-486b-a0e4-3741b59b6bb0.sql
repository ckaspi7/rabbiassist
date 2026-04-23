-- Fix 1: Add fixed search_path to handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$function$;

-- Fix 2: Add RLS policies for storage buckets
CREATE POLICY "Users can only access their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('trip-documents', 'receipts', 'whatsapp-documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can only upload to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('trip-documents', 'receipts', 'whatsapp-documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can only delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id IN ('trip-documents', 'receipts', 'whatsapp-documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 3: Create proper RBAC system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Security definer function to check roles
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Migrate existing roles from users table to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove the role column from users table (keeping it would allow privilege escalation)
ALTER TABLE public.users DROP COLUMN role;